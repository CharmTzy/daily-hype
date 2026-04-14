require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { createClient } = require("redis");
const pool = require("../database");
const cloudinary = require("../cloudinary");
const {
  types,
  categories,
  colours,
  sizes,
  shippers,
  users,
  products,
  carts,
  orders,
} = require("./seed-catalog");

const shouldReset = process.argv.includes("--reset");
const schemaPath = path.join(__dirname, "..", "db", "schema.sql");

const seedConfig = {
  adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@dailyhype.local",
  adminPassword: process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!",
  customerEmail: process.env.SEED_CUSTOMER_EMAIL || "customer@dailyhype.local",
  customerPassword: process.env.SEED_CUSTOMER_PASSWORD || "ChangeMe123!",
};

let cloudinaryUploadsEnabled = cloudinary.isConfigured;
let cloudinaryWarningShown = false;
const uploadedImageCache = new Map();

function toMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function resolveSeedValue(value, fallback = "") {
  if (value && seedConfig[value]) {
    return seedConfig[value];
  }

  return value || fallback;
}

function resolveSeedUser(user) {
  return {
    ...user,
    email: resolveSeedValue(user.emailFrom || user.email),
    rawPassword: resolveSeedValue(user.passwordFrom || user.password, "ChangeMe123!"),
  };
}

function getIsoDaysAgo(daysAgo = 0, minuteOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - Number(daysAgo || 0));
  date.setMinutes(date.getMinutes() + Number(minuteOffset || 0));
  return date.toISOString();
}

function formatAddress(address) {
  return [
    address.fullname,
    [address.block_no, address.street].filter(Boolean).join(" "),
    address.building,
    address.unit_no,
    address.region,
    address.postal_code ? `Singapore ${address.postal_code}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function calculateOrderTotals(order, productContext) {
  let subtotal = 0;
  let totalqty = 0;

  const lineItems = order.items.map((item) => {
    const product = productContext[item.productKey];

    if (!product) {
      throw new Error(`Seed product "${item.productKey}" was not created`);
    }

    const detail = product.details[item.detailIndex];

    if (!detail) {
      throw new Error(`Missing detail index ${item.detailIndex} for product "${item.productKey}"`);
    }

    const unitprice = toMoney(product.unitPrice);
    subtotal += unitprice * item.qty;
    totalqty += item.qty;

    return {
      ...item,
      productid: product.productId,
      productdetailid: detail.productdetailid,
      unitprice,
    };
  });

  const shippingfee = toMoney(order.shippingfee);
  const gst = Number(order.gst || 0);
  const gstAmount = subtotal * (gst / 100);
  const totalamount = toMoney(subtotal + shippingfee + gstAmount);

  return {
    totalqty,
    totalamount,
    shippingfee,
    gst,
    lineItems,
  };
}

function warnCloudinaryFallback(error) {
  if (cloudinaryWarningShown) {
    return;
  }

  cloudinaryWarningShown = true;
  console.warn("Cloudinary upload failed. Falling back to local catalog images.");
  if (error && error.message) {
    console.warn(error.message);
  }
}

async function flushRedisCache() {
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;

  if (!redisUrl && !redisHost) {
    return false;
  }

  const client = createClient(
    redisUrl
      ? {
          url: redisUrl,
        }
      : {
          password: process.env.REDIS_PASSWORD,
          socket: {
            host: redisHost,
            port: Number(process.env.REDIS_PORT || 16272),
          },
        },
  );

  try {
    await client.connect();
    await client.flushAll();
    await client.quit();
    return true;
  } catch (error) {
    console.warn("Unable to flush Redis cache after bootstrap:", error.message);
    if (client.isOpen) {
      await client.quit().catch(() => {});
    }
    return false;
  }
}

async function prepareSeedImage(image) {
  const uploadTarget = image.sourceUrl || image.url;
  const cacheKey = `${image.imageid}:${uploadTarget}`;

  if (uploadedImageCache.has(cacheKey)) {
    return uploadedImageCache.get(cacheKey);
  }

  const originalImage = {
    imageid: image.imageid,
    imagename: image.imagename,
    url: image.url,
  };
  let imagePath = uploadTarget;

  if (!/^https?:\/\//i.test(imagePath || "")) {
    imagePath = path.join(__dirname, "..", "..", "frontend", "public", imagePath.replace(/^\//, ""));
  }

  if (
    !cloudinaryUploadsEnabled ||
    !imagePath ||
    (!/^https?:\/\//i.test(imagePath) && !fs.existsSync(imagePath))
  ) {
    uploadedImageCache.set(cacheKey, originalImage);
    return originalImage;
  }

  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: image.imageid,
      overwrite: true,
      folder: cloudinary.getFolder("catalog"),
      resource_type: "image",
      tags: ["daily-hype", "seed", "catalog"],
    });

    const uploadedImage = {
      imageid: result.public_id,
      imagename: image.imagename,
      url: result.secure_url,
    };

    uploadedImageCache.set(cacheKey, uploadedImage);
    return uploadedImage;
  } catch (error) {
    cloudinaryUploadsEnabled = false;
    warnCloudinaryFallback(error);
    uploadedImageCache.set(cacheKey, originalImage);
    return originalImage;
  }
}

async function upsertNamedTable(client, tableName, columnName, values) {
  const idColumn = `${tableName}id`;
  const mapping = {};

  for (const value of values) {
    const existing = await client.query(
      `SELECT ${idColumn} FROM ${tableName} WHERE ${columnName} = $1`,
      [value],
    );

    if (existing.rows[0]) {
      mapping[value] = existing.rows[0][idColumn];
      continue;
    }

    const inserted = await client.query(
      `INSERT INTO ${tableName} (${columnName}) VALUES ($1) RETURNING ${idColumn}`,
      [value],
    );

    mapping[value] = inserted.rows[0][idColumn];
  }

  return mapping;
}

async function upsertColours(client, items) {
  const mapping = {};

  for (const item of items) {
    const existing = await client.query(
      "SELECT colourid FROM colour WHERE colourname = $1",
      [item.colourname],
    );

    if (existing.rows[0]) {
      await client.query(
        "UPDATE colour SET hex = $2, updatedat = NOW() WHERE colourname = $1",
        [item.colourname, item.hex],
      );
      mapping[item.colourname] = existing.rows[0].colourid;
      continue;
    }

    const inserted = await client.query(
      "INSERT INTO colour (colourname, hex) VALUES ($1, $2) RETURNING colourid",
      [item.colourname, item.hex],
    );

    mapping[item.colourname] = inserted.rows[0].colourid;
  }

  return mapping;
}

async function upsertSizes(client, items) {
  const mapping = {};

  for (const sizeName of items) {
    const existing = await client.query("SELECT sizeid FROM size WHERE sizename = $1", [sizeName]);

    if (existing.rows[0]) {
      mapping[sizeName] = existing.rows[0].sizeid;
      continue;
    }

    const inserted = await client.query(
      "INSERT INTO size (sizename) VALUES ($1) RETURNING sizeid",
      [sizeName],
    );

    mapping[sizeName] = inserted.rows[0].sizeid;
  }

  return mapping;
}

async function upsertShippers(client, items) {
  const mapping = {};

  for (const item of items) {
    const existing = await client.query(
      "SELECT shipperid FROM deliveryshipper WHERE name = $1",
      [item.name],
    );

    if (existing.rows[0]) {
      await client.query(
        "UPDATE deliveryshipper SET phone = $2, updatedat = NOW() WHERE name = $1",
        [item.name, item.phone],
      );
      mapping[item.name] = existing.rows[0].shipperid;
      continue;
    }

    const inserted = await client.query(
      "INSERT INTO deliveryshipper (name, phone) VALUES ($1, $2) RETURNING shipperid",
      [item.name, item.phone],
    );

    mapping[item.name] = inserted.rows[0].shipperid;
  }

  return mapping;
}

async function upsertUser(client, user) {
  const existing = await client.query("SELECT userid FROM appuser WHERE email = $1", [user.email]);

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE appuser
        SET name = $2,
            password = $3,
            phone = $4,
            gender = $5,
            roleid = $6,
            status = $7,
            method = $8,
            verified_email = $9,
            updatedat = NOW()
        WHERE email = $1
      `,
      [
        user.email,
        user.name,
        user.password,
        user.phone,
        user.gender,
        user.roleid,
        user.status,
        user.method,
        user.verified_email,
      ],
    );

    return existing.rows[0].userid;
  }

  const inserted = await client.query(
    `
      INSERT INTO appuser (name, email, password, phone, gender, roleid, status, method, verified_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING userid
    `,
    [
      user.name,
      user.email,
      user.password,
      user.phone,
      user.gender,
      user.roleid,
      user.status,
      user.method,
      user.verified_email,
    ],
  );

  return inserted.rows[0].userid;
}

async function syncUserAddressSummary(client, userid, address) {
  await client.query(
    "UPDATE appuser SET address = $2, region = $3, updatedat = NOW() WHERE userid = $1",
    [userid, formatAddress(address), address.region || null],
  );
}

async function upsertAddress(client, address) {
  if (address.is_default) {
    await client.query("UPDATE address SET is_default = false WHERE userid = $1", [address.userid]);
  }

  const existing = await client.query(
    `
      SELECT address_id
      FROM address
      WHERE userid = $1
        AND postal_code = $2
        AND block_no = $3
        AND COALESCE(street, '') = COALESCE($4, '')
        AND COALESCE(unit_no, '') = COALESCE($5, '')
    `,
    [address.userid, address.postal_code, address.block_no, address.street || "", address.unit_no || ""],
  );

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE address
        SET fullname = $2,
            phone = $3,
            street = $4,
            building = $5,
            unit_no = $6,
            region = $7,
            is_default = $8,
            updatedat = NOW()
        WHERE address_id = $1
      `,
      [
        existing.rows[0].address_id,
        address.fullname,
        address.phone,
        address.street || null,
        address.building || null,
        address.unit_no || null,
        address.region || null,
        address.is_default,
      ],
    );

    return existing.rows[0].address_id;
  }

  const inserted = await client.query(
    `
      INSERT INTO address (
        fullname,
        phone,
        postal_code,
        block_no,
        street,
        building,
        unit_no,
        region,
        userid,
        is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING address_id
    `,
    [
      address.fullname,
      address.phone,
      address.postal_code,
      address.block_no,
      address.street || null,
      address.building || null,
      address.unit_no || null,
      address.region || null,
      address.userid,
      address.is_default,
    ],
  );

  return inserted.rows[0].address_id;
}

async function upsertImage(client, image) {
  await client.query(
    `
      INSERT INTO image (imageid, imagename, url)
      VALUES ($1, $2, $3)
      ON CONFLICT (imageid)
      DO UPDATE SET imagename = EXCLUDED.imagename, url = EXCLUDED.url
    `,
    [image.imageid, image.imagename, image.url],
  );
}

async function upsertProduct(client, product) {
  const existing = await client.query("SELECT productid FROM product WHERE productname = $1", [
    product.productname,
  ]);

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE product
        SET description = $2,
            unitprice = $3,
            categoryid = $4,
            typeid = $5,
            rating = $6,
            soldqty = $7,
            createdat = $8,
            updatedat = NOW()
        WHERE productid = $1
      `,
      [
        existing.rows[0].productid,
        product.description,
        product.unitprice,
        product.categoryid,
        product.typeid,
        product.rating,
        product.soldqty,
        product.createdat,
      ],
    );

    return existing.rows[0].productid;
  }

  const inserted = await client.query(
    `
      INSERT INTO product (productname, description, unitprice, categoryid, typeid, rating, soldqty, createdat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING productid
    `,
    [
      product.productname,
      product.description,
      product.unitprice,
      product.categoryid,
      product.typeid,
      product.rating,
      product.soldqty,
      product.createdat,
    ],
  );

  return inserted.rows[0].productid;
}

async function upsertProductDetail(client, productDetail) {
  const result = await client.query(
    `
      INSERT INTO productdetail (productid, colourid, sizeid, qty, productstatus)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (productid, colourid, sizeid)
      DO UPDATE SET qty = EXCLUDED.qty, productstatus = EXCLUDED.productstatus, updatedat = NOW()
      RETURNING productdetailid
    `,
    [
      productDetail.productid,
      productDetail.colourid,
      productDetail.sizeid,
      productDetail.qty,
      productDetail.productstatus,
    ],
  );

  return result.rows[0].productdetailid;
}

async function upsertCartItem(client, item) {
  const existing = await client.query(
    "SELECT cartid FROM cart WHERE userid = $1 AND productdetailid = $2",
    [item.userid, item.productdetailid],
  );

  if (existing.rows[0]) {
    await client.query("UPDATE cart SET qty = $2, createdat = NOW() WHERE cartid = $1", [
      existing.rows[0].cartid,
      item.qty,
    ]);
    return existing.rows[0].cartid;
  }

  const inserted = await client.query(
    "INSERT INTO cart (cartid, productdetailid, qty, userid) VALUES ($1, $2, $3, $4) RETURNING cartid",
    [item.cartid, item.productdetailid, item.qty, item.userid],
  );

  return inserted.rows[0].cartid;
}

async function upsertDelivery(client, delivery) {
  const existing = await client.query("SELECT deliveryid FROM delivery WHERE trackingnumber = $1", [
    delivery.trackingnumber,
  ]);

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE delivery
        SET deliverydate = $2,
            deliverystatus = $3,
            deliverystatusdetail = $4,
            shipperid = $5,
            updatedat = $6,
            updatedatconfirmed = $6,
            updatedatcheck = $6,
            updatedatway = $6,
            updatedatpick = $6
        WHERE trackingnumber = $1
      `,
      [
        delivery.trackingnumber,
        delivery.deliverydate,
        delivery.deliverystatus,
        delivery.deliverystatusdetail,
        delivery.shipperid,
        delivery.deliverydate,
      ],
    );

    return existing.rows[0].deliveryid;
  }

  const inserted = await client.query(
    `
      INSERT INTO delivery (
        deliverydate,
        deliverystatus,
        deliverystatusdetail,
        trackingnumber,
        shipperid,
        updatedat,
        updatedatconfirmed,
        updatedatcheck,
        updatedatway,
        updatedatpick
      )
      VALUES ($1, $2, $3, $4, $5, $1, $1, $1, $1, $1)
      RETURNING deliveryid
    `,
    [
      delivery.deliverydate,
      delivery.deliverystatus,
      delivery.deliverystatusdetail,
      delivery.trackingnumber,
      delivery.shipperid,
    ],
  );

  return inserted.rows[0].deliveryid;
}

async function upsertOrder(client, order) {
  const existing = await client.query("SELECT orderid FROM productorder WHERE orderid = $1", [order.orderid]);

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE productorder
        SET createdat = $2,
            updatedat = $3,
            totalqty = $4,
            totalamount = $5,
            deliveryaddress = $6,
            orderstatus = $7,
            userid = $8,
            shippingfee = $9,
            gst = $10,
            deliveryid = $11
        WHERE orderid = $1
      `,
      [
        order.orderid,
        order.createdat,
        order.updatedat,
        order.totalqty,
        order.totalamount,
        order.deliveryaddress,
        order.orderstatus,
        order.userid,
        order.shippingfee,
        order.gst,
        order.deliveryid,
      ],
    );

    return existing.rows[0].orderid;
  }

  const inserted = await client.query(
    `
      INSERT INTO productorder (
        orderid,
        createdat,
        updatedat,
        totalqty,
        totalamount,
        deliveryaddress,
        orderstatus,
        userid,
        shippingfee,
        gst,
        deliveryid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING orderid
    `,
    [
      order.orderid,
      order.createdat,
      order.updatedat,
      order.totalqty,
      order.totalamount,
      order.deliveryaddress,
      order.orderstatus,
      order.userid,
      order.shippingfee,
      order.gst,
      order.deliveryid,
    ],
  );

  return inserted.rows[0].orderid;
}

async function upsertOrderItem(client, item) {
  await client.query(
    `
      INSERT INTO productorderitem (productdetailid, orderid, qty, unitprice, deliveryid, createdat)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (orderid, productdetailid)
      DO UPDATE SET qty = EXCLUDED.qty, unitprice = EXCLUDED.unitprice, deliveryid = EXCLUDED.deliveryid
    `,
    [item.productdetailid, item.orderid, item.qty, item.unitprice, item.deliveryid, item.createdat],
  );
}

async function upsertPayment(client, payment) {
  await client.query(
    `
      INSERT INTO payment (paymentid, orderid, paymentmethod, amount, paymentstatus, transactionid, createdat)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (orderid)
      DO UPDATE SET paymentid = EXCLUDED.paymentid,
                    paymentmethod = EXCLUDED.paymentmethod,
                    amount = EXCLUDED.amount,
                    paymentstatus = EXCLUDED.paymentstatus,
                    transactionid = EXCLUDED.transactionid,
                    createdat = EXCLUDED.createdat
    `,
    [
      payment.paymentid,
      payment.orderid,
      payment.paymentmethod,
      payment.amount,
      payment.paymentstatus,
      payment.transactionid,
      payment.createdat,
    ],
  );
}

async function upsertReview(client, review) {
  const existing = await client.query(
    `
      SELECT reviewid
      FROM review
      WHERE userid = $1 AND orderid = $2 AND productdetailid = $3
    `,
    [review.userid, review.orderid, review.productdetailid],
  );

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE review
        SET rating = $2,
            reviewdescription = $3,
            productid = $4,
            createdat = $5,
            updatedat = $6
        WHERE reviewid = $1
      `,
      [
        existing.rows[0].reviewid,
        review.rating,
        review.reviewdescription,
        review.productid,
        review.createdat,
        review.updatedat,
      ],
    );

    return existing.rows[0].reviewid;
  }

  const inserted = await client.query(
    `
      INSERT INTO review (
        rating,
        reviewdescription,
        userid,
        productid,
        createdat,
        updatedat,
        productdetailid,
        orderid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING reviewid
    `,
    [
      review.rating,
      review.reviewdescription,
      review.userid,
      review.productid,
      review.createdat,
      review.updatedat,
      review.productdetailid,
      review.orderid,
    ],
  );

  return inserted.rows[0].reviewid;
}

async function upsertRefund(client, refund) {
  await client.query(
    `
      INSERT INTO orderrefund (
        refundid,
        refundamount,
        refundreason,
        refundcategory,
        refundstatus,
        createdat,
        updatedat,
        orderid,
        productdetailid,
        refundqty
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (refundid)
      DO UPDATE SET refundamount = EXCLUDED.refundamount,
                    refundreason = EXCLUDED.refundreason,
                    refundcategory = EXCLUDED.refundcategory,
                    refundstatus = EXCLUDED.refundstatus,
                    createdat = EXCLUDED.createdat,
                    updatedat = EXCLUDED.updatedat,
                    orderid = EXCLUDED.orderid,
                    productdetailid = EXCLUDED.productdetailid,
                    refundqty = EXCLUDED.refundqty
    `,
    [
      refund.refundid,
      refund.refundamount,
      refund.refundreason,
      refund.refundcategory,
      refund.refundstatus,
      refund.createdat,
      refund.updatedat,
      refund.orderid,
      refund.productdetailid,
      refund.refundqty,
    ],
  );
}

async function ensureChatRoom(client, chat) {
  const existing = await client.query(
    "SELECT roomid FROM chat WHERE adminuserid = $1 AND useruserid = $2 AND deliveryid = $3",
    [chat.adminuserid, chat.useruserid, chat.deliveryid],
  );

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE chat
        SET userenteredchat = $2,
            adminenteredchat = $3,
            speakerid = $4
        WHERE roomid = $1
      `,
      [existing.rows[0].roomid, chat.userenteredchat, chat.adminenteredchat, chat.speakerid],
    );

    return existing.rows[0].roomid;
  }

  const inserted = await client.query(
    `
      INSERT INTO chat (
        adminuserid,
        deliveryid,
        useruserid,
        userenteredchat,
        adminenteredchat,
        speakerid,
        createdat
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING roomid
    `,
    [
      chat.adminuserid,
      chat.deliveryid,
      chat.useruserid,
      chat.userenteredchat,
      chat.adminenteredchat,
      chat.speakerid,
      chat.createdat,
    ],
  );

  return inserted.rows[0].roomid;
}

async function upsertChatMessage(client, message) {
  const roomid = await ensureChatRoom(client, {
    adminuserid: message.adminuserid,
    deliveryid: message.deliveryid,
    useruserid: message.useruserid,
    userenteredchat: true,
    adminenteredchat: true,
    speakerid: message.speakerid,
    createdat: message.createdat,
  });

  const existing = await client.query(
    "SELECT messageid FROM message WHERE roomid = $1 AND msgcontent = $2",
    [roomid, message.msgcontent],
  );

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE message
        SET messagedatetime = $2,
            speakerid = $3,
            messagereaduser = $4,
            messagereadadmin = $5,
            createdat = $6
        WHERE messageid = $1
      `,
      [
        existing.rows[0].messageid,
        message.messagedatetime,
        message.speakerid,
        message.messagereaduser,
        message.messagereadadmin,
        message.createdat,
      ],
    );

    return existing.rows[0].messageid;
  }

  const inserted = await client.query(
    `
      INSERT INTO message (
        messagedatetime,
        msgcontent,
        roomid,
        speakerid,
        messagereaduser,
        messagereadadmin,
        createdat
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING messageid
    `,
    [
      message.messagedatetime,
      message.msgcontent,
      roomid,
      message.speakerid,
      message.messagereaduser,
      message.messagereadadmin,
      message.createdat,
    ],
  );

  return inserted.rows[0].messageid;
}

async function run() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (shouldReset) {
      await client.query("DROP SCHEMA public CASCADE");
      await client.query("CREATE SCHEMA public");
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await client.query(schemaSql);

    const roleIds = await upsertNamedTable(client, "role", "rolename", ["admin", "manager", "customer"]);
    const typeIds = await upsertNamedTable(client, "type", "typename", types);
    const categoryIds = await upsertNamedTable(client, "category", "categoryname", categories);
    const colourIds = await upsertColours(client, colours);
    const sizeIds = await upsertSizes(client, sizes);
    const shipperIds = await upsertShippers(client, shippers);

    const userContext = {};

    for (const userSeed of users.map(resolveSeedUser)) {
      const userid = await upsertUser(client, {
        email: userSeed.email,
        name: userSeed.name,
        password: await bcrypt.hash(userSeed.rawPassword, 10),
        phone: userSeed.phone,
        gender: userSeed.gender,
        roleid: roleIds[userSeed.role],
        status: userSeed.status,
        method: userSeed.method,
        verified_email: userSeed.verified_email,
      });

      const context = {
        ...userSeed,
        userid,
        addresses: [],
        defaultAddress: null,
      };

      for (const address of userSeed.addresses || []) {
        const address_id = await upsertAddress(client, {
          ...address,
          userid,
        });

        const storedAddress = {
          ...address,
          address_id,
        };

        context.addresses.push(storedAddress);

        if (address.is_default) {
          context.defaultAddress = storedAddress;
          await syncUserAddressSummary(client, userid, storedAddress);
        }
      }

      if (!context.defaultAddress && context.addresses[0]) {
        context.defaultAddress = context.addresses[0];
        await syncUserAddressSummary(client, userid, context.addresses[0]);
      }

      userContext[userSeed.key] = context;
    }

    const productContext = {};

    for (const product of products) {
      const productId = await upsertProduct(client, {
        productname: product.name,
        description: product.description,
        unitprice: product.unitPrice,
        categoryid: categoryIds[product.category],
        typeid: typeIds[product.type],
        rating: product.rating,
        soldqty: product.soldqty,
        createdat: getIsoDaysAgo(product.createdAtDaysAgo || 0),
      });

      await client.query("DELETE FROM productimage WHERE productid = $1", [productId]);

      const context = {
        productId,
        unitPrice: product.unitPrice,
        details: [],
        images: [],
      };

      for (const sourceImage of product.images) {
        const preparedImage = await prepareSeedImage(sourceImage);
        await upsertImage(client, preparedImage);
        await client.query(
          "INSERT INTO productimage (productid, imageid) VALUES ($1, $2) ON CONFLICT (productid, imageid) DO NOTHING",
          [productId, preparedImage.imageid],
        );
        context.images.push(preparedImage);
      }

      for (const detail of product.details) {
        const productdetailid = await upsertProductDetail(client, {
          productid: productId,
          colourid: colourIds[detail.colour],
          sizeid: sizeIds[detail.size],
          qty: detail.qty,
          productstatus: detail.qty > 0 ? "in stock" : "out of stock",
        });

        context.details.push({
          ...detail,
          productdetailid,
        });
      }

      productContext[product.key] = context;
    }

    let cartIdCounter = 880000000001;

    for (const cart of carts) {
      const user = userContext[cart.customerKey];

      if (!user) {
        continue;
      }

      await client.query("DELETE FROM cart WHERE userid = $1", [user.userid]);

      for (const item of cart.items) {
        const product = productContext[item.productKey];
        const detail = product && product.details[item.detailIndex];

        if (!detail) {
          throw new Error(`Missing cart detail for ${item.productKey}`);
        }

        await upsertCartItem(client, {
          cartid: cartIdCounter++,
          productdetailid: detail.productdetailid,
          qty: item.qty,
          userid: user.userid,
        });
      }
    }

    const adminUser = userContext.admin || userContext.manager;

    if (!adminUser) {
      throw new Error("Seed admin user is missing");
    }

    for (const order of orders) {
      const customer = userContext[order.customerKey];

      if (!customer) {
        throw new Error(`Seed customer "${order.customerKey}" was not created`);
      }

      const selectedAddress =
        customer.addresses[order.addressIndex] || customer.defaultAddress || customer.addresses[0];

      if (!selectedAddress) {
        throw new Error(`Customer "${order.customerKey}" does not have an address for order ${order.orderid}`);
      }

      const deliveryid = await upsertDelivery(client, {
        deliverydate: getIsoDaysAgo(order.delivery.daysAgo),
        deliverystatus: order.delivery.deliverystatus,
        deliverystatusdetail: order.delivery.deliverystatusdetail,
        trackingnumber: order.delivery.trackingnumber,
        shipperid: shipperIds[order.delivery.shipper],
      });

      const orderCreatedAt = getIsoDaysAgo(order.createdAtDaysAgo);
      const totals = calculateOrderTotals(order, productContext);

      await upsertOrder(client, {
        orderid: order.orderid,
        createdat: orderCreatedAt,
        updatedat: orderCreatedAt,
        totalqty: totals.totalqty,
        totalamount: totals.totalamount,
        deliveryaddress: formatAddress(selectedAddress),
        orderstatus: order.orderstatus,
        userid: customer.userid,
        shippingfee: totals.shippingfee,
        gst: totals.gst,
        deliveryid,
      });

      await client.query("DELETE FROM productorderitem WHERE orderid = $1", [order.orderid]);

      for (const lineItem of totals.lineItems) {
        await upsertOrderItem(client, {
          orderid: order.orderid,
          productdetailid: lineItem.productdetailid,
          qty: lineItem.qty,
          unitprice: lineItem.unitprice,
          deliveryid,
          createdat: orderCreatedAt,
        });
      }

      await upsertPayment(client, {
        paymentid: order.paymentid,
        orderid: order.orderid,
        paymentmethod: "card",
        amount: totals.totalamount,
        paymentstatus: "succeeded",
        transactionid: `pi_seed_${order.paymentid}`,
        createdat: orderCreatedAt,
      });

      for (const review of order.reviews || []) {
        const product = productContext[review.productKey];
        const detail = product && product.details[review.detailIndex];

        if (!detail) {
          throw new Error(`Missing review detail for ${review.productKey}`);
        }

        const reviewCreatedAt = getIsoDaysAgo(Math.max(order.delivery.daysAgo - 1, 0));

        await upsertReview(client, {
          rating: review.rating,
          reviewdescription: review.text,
          userid: customer.userid,
          productid: product.productId,
          createdat: reviewCreatedAt,
          updatedat: reviewCreatedAt,
          productdetailid: detail.productdetailid,
          orderid: order.orderid,
        });
      }

      if (order.refund) {
        const product = productContext[order.refund.productKey];
        const detail = product && product.details[order.refund.detailIndex];

        if (!detail) {
          throw new Error(`Missing refund detail for ${order.refund.productKey}`);
        }

        const refundCreatedAt = getIsoDaysAgo(Math.max(order.delivery.daysAgo - 1, 0), 30);

        await upsertRefund(client, {
          refundid: order.refundid,
          refundamount: toMoney(order.refund.amount),
          refundreason: order.refund.reason,
          refundcategory: order.refund.category,
          refundstatus: order.refund.status,
          createdat: refundCreatedAt,
          updatedat: refundCreatedAt,
          orderid: order.orderid,
          productdetailid: detail.productdetailid,
          refundqty: order.refund.qty,
        });
      }

      if (order.chatMessage) {
        const messageTime = getIsoDaysAgo(Math.max(order.delivery.daysAgo - 1, 0), 45);

        await upsertChatMessage(client, {
          adminuserid: adminUser.userid,
          useruserid: customer.userid,
          deliveryid,
          speakerid: adminUser.userid,
          msgcontent: order.chatMessage,
          messagedatetime: messageTime,
          messagereaduser: true,
          messagereadadmin: true,
          createdat: messageTime,
        });
      }
    }

    await client.query("COMMIT");

    const imageMode = cloudinaryUploadsEnabled ? "Cloudinary" : "local generated assets";
    const cacheFlushed = await flushRedisCache();

    console.log("Database bootstrap completed.");
    console.log(`Seeded ${products.length} products, ${orders.length} orders, and ${users.length} users.`);
    console.log(`Image source: ${imageMode}`);
    console.log(`Redis cache reset: ${cacheFlushed ? "yes" : "no"}`);
    console.log(`Admin login: ${seedConfig.adminEmail} / ${seedConfig.adminPassword}`);
    console.log(`Customer login: ${seedConfig.customerEmail} / ${seedConfig.customerPassword}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database bootstrap failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
