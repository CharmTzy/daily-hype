require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const pool = require("../database");
const cloudinary = require("../cloudinary");

const shouldReset = process.argv.includes("--reset");

const seedConfig = {
  adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@dailyhype.local",
  adminPassword: process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!",
  customerEmail: process.env.SEED_CUSTOMER_EMAIL || "customer@dailyhype.local",
  customerPassword: process.env.SEED_CUSTOMER_PASSWORD || "ChangeMe123!",
};

const schemaPath = path.join(__dirname, "..", "db", "schema.sql");

const types = ["woman", "man", "girl", "boy", "baby"];
const categories = ["tops", "hoodies", "dresses", "outerwear", "accessories"];
const colours = [
  { colourname: "black", hex: "111827" },
  { colourname: "white", hex: "F9FAFB" },
  { colourname: "navy", hex: "1E3A8A" },
  { colourname: "sand", hex: "D6C6A8" },
  { colourname: "rose", hex: "E11D48" },
];
const sizes = ["XS", "S", "M", "L", "XL"];
const shippers = [
  { name: "Ninja Van", phone: "+65 3158 1111" },
  { name: "J&T Express", phone: "+65 6931 6666" },
  { name: "SingPost", phone: "+65 1605" },
];

const products = [
  {
    name: "Everyday Tee",
    description: "Soft cotton tee built for repeat wear.",
    unitPrice: 24.9,
    type: "man",
    category: "tops",
    rating: 4.4,
    soldqty: 32,
    images: [
      { imageid: "seed-everyday-tee-1", imagename: "Everyday Tee", url: "/images/sample.jpg" },
    ],
    details: [
      { colour: "black", size: "M", qty: 12 },
      { colour: "black", size: "L", qty: 9 },
      { colour: "white", size: "M", qty: 6 },
    ],
  },
  {
    name: "Varsity Hoodie",
    description: "Heavyweight hoodie with a relaxed, layered fit.",
    unitPrice: 59.9,
    type: "man",
    category: "hoodies",
    rating: 4.8,
    soldqty: 19,
    images: [
      { imageid: "seed-varsity-hoodie-1", imagename: "Varsity Hoodie", url: "/images/logo-light.png" },
    ],
    details: [
      { colour: "navy", size: "M", qty: 7 },
      { colour: "navy", size: "L", qty: 8 },
      { colour: "sand", size: "M", qty: 5 },
    ],
  },
  {
    name: "Linen Slip Dress",
    description: "Lightweight summer dress with an easy silhouette.",
    unitPrice: 68.9,
    type: "woman",
    category: "dresses",
    rating: 4.6,
    soldqty: 14,
    images: [
      { imageid: "seed-linen-dress-1", imagename: "Linen Slip Dress", url: "/images/logo.png" },
    ],
    details: [
      { colour: "rose", size: "S", qty: 6 },
      { colour: "rose", size: "M", qty: 8 },
      { colour: "sand", size: "M", qty: 4 },
    ],
  },
  {
    name: "Transit Jacket",
    description: "Clean outer layer for cool evenings and daily commutes.",
    unitPrice: 84.9,
    type: "woman",
    category: "outerwear",
    rating: 4.7,
    soldqty: 11,
    images: [
      { imageid: "seed-transit-jacket-1", imagename: "Transit Jacket", url: "/images/sample.jpg" },
    ],
    details: [
      { colour: "black", size: "S", qty: 5 },
      { colour: "black", size: "M", qty: 5 },
      { colour: "sand", size: "M", qty: 3 },
    ],
  },
  {
    name: "Classic Cap",
    description: "Structured cap with a minimal front mark.",
    unitPrice: 18.9,
    type: "man",
    category: "accessories",
    rating: 4.2,
    soldqty: 23,
    images: [
      { imageid: "seed-classic-cap-1", imagename: "Classic Cap", url: "/images/logo-light.png" },
    ],
    details: [
      { colour: "black", size: "M", qty: 15 },
      { colour: "navy", size: "M", qty: 9 },
    ],
  },
  {
    name: "Harbor Knit Polo",
    description: "Lightweight knit polo with a cleaner drape for smarter casual looks.",
    unitPrice: 42.9,
    type: "man",
    category: "tops",
    rating: 4.5,
    soldqty: 17,
    images: [
      { imageid: "seed-harbor-knit-polo-1", imagename: "Harbor Knit Polo", url: "/images/sample.jpg" },
    ],
    details: [
      { colour: "white", size: "M", qty: 8 },
      { colour: "white", size: "L", qty: 6 },
      { colour: "navy", size: "M", qty: 5 },
    ],
  },
  {
    name: "Studio Rib Tank",
    description: "Fitted rib tank with stretch comfort for everyday layering.",
    unitPrice: 26.9,
    type: "woman",
    category: "tops",
    rating: 4.4,
    soldqty: 21,
    images: [
      { imageid: "seed-studio-rib-tank-1", imagename: "Studio Rib Tank", url: "/images/logo.png" },
    ],
    details: [
      { colour: "rose", size: "S", qty: 10 },
      { colour: "rose", size: "M", qty: 8 },
      { colour: "white", size: "M", qty: 7 },
    ],
  },
  {
    name: "Weekend Skirt Set",
    description: "Playful matching set with soft structure for outings and birthdays.",
    unitPrice: 44.9,
    type: "girl",
    category: "dresses",
    rating: 4.7,
    soldqty: 12,
    images: [
      { imageid: "seed-weekend-skirt-set-1", imagename: "Weekend Skirt Set", url: "/images/logo.png" },
    ],
    details: [
      { colour: "rose", size: "XS", qty: 6 },
      { colour: "rose", size: "S", qty: 5 },
      { colour: "white", size: "S", qty: 4 },
    ],
  },
  {
    name: "Playground Jogger",
    description: "Easy-wear joggers built for school runs, weekends, and repeat washes.",
    unitPrice: 29.9,
    type: "boy",
    category: "outerwear",
    rating: 4.3,
    soldqty: 15,
    images: [
      { imageid: "seed-playground-jogger-1", imagename: "Playground Jogger", url: "/images/sample.jpg" },
    ],
    details: [
      { colour: "navy", size: "S", qty: 7 },
      { colour: "navy", size: "M", qty: 8 },
      { colour: "black", size: "M", qty: 6 },
    ],
  },
  {
    name: "Tiny Day Romper",
    description: "Soft all-in-one romper with easy snap closures for daily changes.",
    unitPrice: 22.9,
    type: "baby",
    category: "tops",
    rating: 4.8,
    soldqty: 28,
    images: [
      { imageid: "seed-tiny-day-romper-1", imagename: "Tiny Day Romper", url: "/images/logo-light.png" },
    ],
    details: [
      { colour: "sand", size: "XS", qty: 10 },
      { colour: "sand", size: "S", qty: 9 },
      { colour: "white", size: "XS", qty: 7 },
    ],
  },
  {
    name: "Mini Explorer Hoodie",
    description: "Brushed fleece hoodie sized for cool mornings and fast-moving kids.",
    unitPrice: 34.9,
    type: "boy",
    category: "hoodies",
    rating: 4.6,
    soldqty: 18,
    images: [
      { imageid: "seed-mini-explorer-hoodie-1", imagename: "Mini Explorer Hoodie", url: "/images/logo-light.png" },
    ],
    details: [
      { colour: "navy", size: "S", qty: 5 },
      { colour: "navy", size: "M", qty: 7 },
      { colour: "sand", size: "M", qty: 5 },
    ],
  },
];

async function prepareSeedImage(image) {
  const imagePath = path.join(__dirname, "..", "..", "frontend", "public", image.url.replace(/^\//, ""));

  if (!cloudinary.isConfigured || !fs.existsSync(imagePath)) {
    return image;
  }

  const result = await cloudinary.uploader.upload(imagePath, {
    public_id: image.imageid,
    overwrite: true,
    tags: ["daily-hype", "seed"],
  });

  return {
    imageid: result.public_id,
    imagename: image.imagename,
    url: result.secure_url,
  };
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

    const adminPasswordHash = await bcrypt.hash(seedConfig.adminPassword, 10);
    const customerPasswordHash = await bcrypt.hash(seedConfig.customerPassword, 10);

    const adminId = await upsertUser(client, {
      email: seedConfig.adminEmail,
      name: "DailyHype Admin",
      password: adminPasswordHash,
      phone: "90000001",
      gender: "M",
      roleid: roleIds.admin,
      status: "active",
      method: "normal",
      verified_email: true,
    });

    const customerId = await upsertUser(client, {
      email: seedConfig.customerEmail,
      name: "Sample Customer",
      password: customerPasswordHash,
      phone: "90000002",
      gender: "F",
      roleid: roleIds.customer,
      status: "active",
      method: "normal",
      verified_email: true,
    });

    const addressId = await upsertAddress(client, {
      fullname: "Sample Customer",
      phone: "90000002",
      postal_code: "238801",
      block_no: "100",
      street: "Orchard Road",
      building: "DailyHype Residence",
      unit_no: "#08-08",
      region: "Central",
      userid: customerId,
      is_default: true,
    });

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
      });

      productContext[product.name] = {
        productId,
        detailIds: [],
      };

      for (const originalImage of product.images) {
        const image = await prepareSeedImage(originalImage);

        await client.query(
          `
            INSERT INTO image (imageid, imagename, url)
            VALUES ($1, $2, $3)
            ON CONFLICT (imageid)
            DO UPDATE SET imagename = EXCLUDED.imagename, url = EXCLUDED.url
          `,
          [image.imageid, image.imagename, image.url],
        );

        await client.query(
          `
            INSERT INTO productimage (productid, imageid)
            VALUES ($1, $2)
            ON CONFLICT (productid, imageid) DO NOTHING
          `,
          [productId, image.imageid],
        );
      }

      for (const detail of product.details) {
        const detailResult = await client.query(
          `
            INSERT INTO productdetail (productid, colourid, sizeid, qty, productstatus)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (productid, colourid, sizeid)
            DO UPDATE SET qty = EXCLUDED.qty, productstatus = EXCLUDED.productstatus, updatedat = NOW()
            RETURNING productdetailid
          `,
          [
            productId,
            colourIds[detail.colour],
            sizeIds[detail.size],
            detail.qty,
            detail.qty > 0 ? "in stock" : "out of stock",
          ],
        );

        productContext[product.name].detailIds.push(detailResult.rows[0].productdetailid);
      }
    }

    const deliveryId = await upsertDelivery(client, {
      deliverydate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      deliverystatus: "completed",
      deliverystatusdetail: "Product delivered",
      trackingnumber: "DH-TRACK-1001",
      shipperid: shipperIds["Ninja Van"],
    });

    const orderId = 202604080001;
    const paymentId = 202604080101;
    const refundId = 202604080201;
    const purchasedDetails = [
      {
        productdetailid: productContext["Everyday Tee"].detailIds[0],
        qty: 1,
        unitprice: 24.9,
      },
      {
        productdetailid: productContext["Varsity Hoodie"].detailIds[0],
        qty: 1,
        unitprice: 59.9,
      },
    ];

    await client.query(
      `
        INSERT INTO productorder (orderid, createdat, updatedat, totalqty, totalamount, deliveryaddress, orderstatus, userid, shippingfee, gst, deliveryid)
        VALUES ($1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', $2, $3, $4, 'received', $5, 1.50, 9.00, $6)
        ON CONFLICT (orderid)
        DO UPDATE SET totalqty = EXCLUDED.totalqty,
                      totalamount = EXCLUDED.totalamount,
                      deliveryaddress = EXCLUDED.deliveryaddress,
                      orderstatus = EXCLUDED.orderstatus,
                      userid = EXCLUDED.userid,
                      deliveryid = EXCLUDED.deliveryid
      `,
      [orderId, 2, 94.59, "Blk 100, Orchard Road, DailyHype Residence, #08-08, Singapore 238801", customerId, deliveryId],
    );

    for (const item of purchasedDetails) {
      await client.query(
        `
          INSERT INTO productorderitem (productdetailid, orderid, qty, unitprice, deliveryid)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (orderid, productdetailid)
          DO UPDATE SET qty = EXCLUDED.qty, unitprice = EXCLUDED.unitprice, deliveryid = EXCLUDED.deliveryid
        `,
        [item.productdetailid, orderId, item.qty, item.unitprice, deliveryId],
      );
    }

    await client.query(
      `
        INSERT INTO payment (paymentid, orderid, paymentmethod, amount, paymentstatus, transactionid)
        VALUES ($1, $2, 'card', 94.59, 'succeeded', 'pi_seed_1001')
        ON CONFLICT (paymentid)
        DO UPDATE SET paymentmethod = EXCLUDED.paymentmethod,
                      amount = EXCLUDED.amount,
                      paymentstatus = EXCLUDED.paymentstatus,
                      transactionid = EXCLUDED.transactionid
      `,
      [paymentId, orderId],
    );

    await client.query(
      `
        INSERT INTO chat (adminuserid, deliveryid, useruserid, userenteredchat, adminenteredchat)
        VALUES ($1, $2, $3, true, true)
        ON CONFLICT (adminuserid, useruserid, deliveryid)
        DO NOTHING
      `,
      [adminId, deliveryId, customerId],
    );

    const roomResult = await client.query(
      `SELECT roomid FROM chat WHERE adminuserid = $1 AND useruserid = $2 AND deliveryid = $3`,
      [adminId, customerId, deliveryId],
    );
    const roomId = roomResult.rows[0].roomid;

    const existingMessage = await client.query(
      `SELECT messageid FROM message WHERE roomid = $1 AND msgcontent = $2`,
      [roomId, "Your order is on the way."],
    );

    if (!existingMessage.rows[0]) {
      await client.query(
        `
          INSERT INTO message (messagedatetime, msgcontent, roomid, speakerid, messagereaduser, messagereadadmin)
          VALUES (NOW() - INTERVAL '6 days', 'Your order is on the way.', $1, $2, true, true)
        `,
        [roomId, adminId],
      );
    }

    const existingReview = await client.query(
      `
        SELECT reviewid
        FROM review
        WHERE userid = $1 AND orderid = $2 AND productdetailid = $3
      `,
      [customerId, orderId, productContext["Everyday Tee"].detailIds[0]],
    );

    if (!existingReview.rows[0]) {
      await client.query(
        `
          INSERT INTO review (rating, reviewdescription, userid, productid, createdat, updatedat, productdetailid, orderid)
          VALUES (5, 'Really happy with the fit and fabric.', $1, $2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', $3, $4)
        `,
        [customerId, productContext["Everyday Tee"].productId, productContext["Everyday Tee"].detailIds[0], orderId],
      );
    }

    await client.query(
      `
        INSERT INTO orderrefund (refundid, refundamount, refundreason, refundcategory, refundstatus, orderid, productdetailid, refundqty)
        VALUES ($1, 24.90, 'Sample refund request for testing.', 'size issue', 'pending', $2, $3, 1)
        ON CONFLICT (refundid)
        DO UPDATE SET refundamount = EXCLUDED.refundamount,
                      refundreason = EXCLUDED.refundreason,
                      refundcategory = EXCLUDED.refundcategory,
                      refundstatus = EXCLUDED.refundstatus
      `,
      [refundId, orderId, productContext["Everyday Tee"].detailIds[0]],
    );

    await client.query("COMMIT");

    console.log("Database bootstrap completed.");
    console.log(`Admin login: ${seedConfig.adminEmail} / ${seedConfig.adminPassword}`);
    console.log(`Customer login: ${seedConfig.customerEmail} / ${seedConfig.customerPassword}`);
    console.log(`Default address ID: ${addressId}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database bootstrap failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

async function upsertNamedTable(client, tableName, columnName, values) {
  const mapping = {};

  for (const value of values) {
    const existing = await client.query(`SELECT * FROM ${tableName} WHERE ${columnName} = $1`, [value]);

    if (existing.rows[0]) {
      mapping[value] = existing.rows[0][`${tableName}id`] || existing.rows[0][columnName.replace("name", "id")];
      continue;
    }

    const inserted = await client.query(
      `INSERT INTO ${tableName} (${columnName}) VALUES ($1) RETURNING *`,
      [value],
    );
    mapping[value] = inserted.rows[0][`${tableName}id`] || inserted.rows[0][columnName.replace("name", "id")];
  }

  return normalizeIdentityMap(tableName, mapping);
}

function normalizeIdentityMap(tableName, mapping) {
  const normalized = {};

  Object.entries(mapping).forEach(([key, value]) => {
    normalized[key] = value;
  });

  if (tableName === "role") return normalized;
  if (tableName === "type") return normalized;
  if (tableName === "category") return normalized;

  return normalized;
}

async function upsertColours(client, items) {
  const mapping = {};

  for (const item of items) {
    const existing = await client.query(`SELECT colourid FROM colour WHERE colourname = $1`, [item.colourname]);

    if (existing.rows[0]) {
      await client.query(`UPDATE colour SET hex = $2, updatedat = NOW() WHERE colourname = $1`, [item.colourname, item.hex]);
      mapping[item.colourname] = existing.rows[0].colourid;
      continue;
    }

    const inserted = await client.query(
      `INSERT INTO colour (colourname, hex) VALUES ($1, $2) RETURNING colourid`,
      [item.colourname, item.hex],
    );
    mapping[item.colourname] = inserted.rows[0].colourid;
  }

  return mapping;
}

async function upsertSizes(client, items) {
  const mapping = {};

  for (const sizeName of items) {
    const existing = await client.query(`SELECT sizeid FROM size WHERE sizename = $1`, [sizeName]);

    if (existing.rows[0]) {
      mapping[sizeName] = existing.rows[0].sizeid;
      continue;
    }

    const inserted = await client.query(
      `INSERT INTO size (sizename) VALUES ($1) RETURNING sizeid`,
      [sizeName],
    );
    mapping[sizeName] = inserted.rows[0].sizeid;
  }

  return mapping;
}

async function upsertShippers(client, items) {
  const mapping = {};

  for (const item of items) {
    const existing = await client.query(`SELECT shipperid FROM deliveryshipper WHERE name = $1`, [item.name]);

    if (existing.rows[0]) {
      await client.query(`UPDATE deliveryshipper SET phone = $2, updatedat = NOW() WHERE name = $1`, [item.name, item.phone]);
      mapping[item.name] = existing.rows[0].shipperid;
      continue;
    }

    const inserted = await client.query(
      `INSERT INTO deliveryshipper (name, phone) VALUES ($1, $2) RETURNING shipperid`,
      [item.name, item.phone],
    );
    mapping[item.name] = inserted.rows[0].shipperid;
  }

  return mapping;
}

async function upsertUser(client, user) {
  const existing = await client.query(`SELECT userid FROM appuser WHERE email = $1`, [user.email]);

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
      [user.email, user.name, user.password, user.phone, user.gender, user.roleid, user.status, user.method, user.verified_email],
    );
    return existing.rows[0].userid;
  }

  const inserted = await client.query(
    `
      INSERT INTO appuser (name, email, password, phone, gender, roleid, status, method, verified_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING userid
    `,
    [user.name, user.email, user.password, user.phone, user.gender, user.roleid, user.status, user.method, user.verified_email],
  );

  return inserted.rows[0].userid;
}

async function upsertAddress(client, address) {
  await client.query(`UPDATE address SET is_default = false WHERE userid = $1`, [address.userid]);

  const existing = await client.query(
    `
      SELECT address_id
      FROM address
      WHERE userid = $1 AND postal_code = $2 AND block_no = $3 AND street = $4
    `,
    [address.userid, address.postal_code, address.block_no, address.street],
  );

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE address
        SET fullname = $2,
            phone = $3,
            building = $4,
            unit_no = $5,
            region = $6,
            is_default = $7,
            updatedat = NOW()
        WHERE address_id = $1
      `,
      [existing.rows[0].address_id, address.fullname, address.phone, address.building, address.unit_no, address.region, address.is_default],
    );
    return existing.rows[0].address_id;
  }

  const inserted = await client.query(
    `
      INSERT INTO address (fullname, phone, postal_code, block_no, street, building, unit_no, region, userid, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING address_id
    `,
    [
      address.fullname,
      address.phone,
      address.postal_code,
      address.block_no,
      address.street,
      address.building,
      address.unit_no,
      address.region,
      address.userid,
      address.is_default,
    ],
  );

  return inserted.rows[0].address_id;
}

async function upsertProduct(client, product) {
  const existing = await client.query(`SELECT productid FROM product WHERE productname = $1`, [product.productname]);

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
      ],
    );
    return existing.rows[0].productid;
  }

  const inserted = await client.query(
    `
      INSERT INTO product (productname, description, unitprice, categoryid, typeid, rating, soldqty)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
    ],
  );

  return inserted.rows[0].productid;
}

async function upsertDelivery(client, delivery) {
  const existing = await client.query(`SELECT deliveryid FROM delivery WHERE trackingnumber = $1`, [delivery.trackingnumber]);

  if (existing.rows[0]) {
    await client.query(
      `
        UPDATE delivery
        SET deliverydate = $2,
            deliverystatus = $3,
            deliverystatusdetail = $4,
            shipperid = $5,
            updatedat = NOW(),
            updatedatconfirmed = NOW(),
            updatedatcheck = NOW(),
            updatedatway = NOW(),
            updatedatpick = NOW()
        WHERE trackingnumber = $1
      `,
      [
        delivery.trackingnumber,
        delivery.deliverydate,
        delivery.deliverystatus,
        delivery.deliverystatusdetail,
        delivery.shipperid,
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
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), NOW(), NOW())
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

run();
