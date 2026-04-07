// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

/**
 * enum used for current active page values
 */
export enum CurrentActivePage {
  Home = "home",
  Explore = "explore",
  Search = "search",
  Man = "man",
  Woman = "woman",
  Boy = "boy",
  Girl = "girl",
  Baby = "baby",
  PersonalCenter = "personal center",
  Profile = "my profile",
  AddressBook = "address book",
  AllOrder = "all orders",
  InProgressOrder = "in progress orders",
  ConfirmedOrder = "confirmed orders",
  DeliveredOrder = "delivered orders",
  ReceivedOrder = "received orders",
  CancelledOrder = "cancelled orders",
  ReturnedOrder = "returned orders",
  AllDelivery = "all deliveries",
  UserForm = "user form",
  ProductForm = "product form",
  CategoryForm = "category form",
  ColourForm = "colour form",
  SizeForm = "size form",
  DeliveryForm = "delivery form",
  ReviewForm = "review form",
  UserList = "user list",
  ProductList = "product list",
  CartList = "cart list",
  OrderList = "order list",
  RefundList = "refund list",
  DeliveryList = "delivery list",
  ReviewList = "review list",
  UserStat = "user stat",
  ProductStat = "product stat",
  OrderStat = "order stat",
  DeliveryStat = "delivery stat",
  ReviewStat = "review stat",
  AdminProfile = "admin profile",
  AdminSetting = "admin setting",
  None = "none",
}

/**
 * enum used for url routing
 */
export enum URL {
  Home = "/",
  Explore = "/explore",
  Search = "/search",
  Man = "/man",
  Woman = "/woman",
  Boy = "/boy",
  Girl = "/girl",
  Baby = "/baby",
  Cart = "/cart",
  Personal = "/personal",
  Profile = "/profile",
  ProductDetail = "/detail/",
  AllOrder = "/order/all",
  InProgressOrder = "/order/inprogress",
  ConfirmedOrder = "/order/confirmed",
  DeliveredOrder = "/order/delivered",
  ReceivedOrder = "/order/received",
  CancelledOrder = "/order/cancelled",
  ReturnedOrder = "/order/returned",
  UserOrderDetail = "/order/orderdetail/",
  WriteReview = "/review",
  Delivery = "/delivery",
  SignIn = "/signin",
  SignUp = "/signup",
  SignOut = "/signout",
  About = "/about",
  Contact = "/contact",
  DeliveryInsert = "/list/deliveryinsertdelete",
  DeliveryList = "/list/deliverytable",
  DeliveryStats = "/stats/deliverystats",
  Feedback = "/feedback",
  Help = "/help",
  PrivacyPolicy = "/privacypolicy",
  TermsNConditions = "/terms",
  SiteMap = "/sitemap",
  Dashboard = "/dashboard",
  UserForm = "/form/user",
  UserList = "/list/user",
  UserStat = "/stats/user",
  ProductList = "/list/product",
  CartList = "/list/cart",
  OrderList = "/list/order",
  RefundList = "/list/refund",
  ConfirmOrder = "/form/orderconfirm",
  AdminOrderDetail = "/list/order/",
  OrderStat = "/stats/order",
  ReviewList = "/list/review",
  ProductForm = "/form/product/register",
  CategoryForm = "/form/category/register",
  ColourForm = "/form/colour/register",
  SizeForm = "/form/size/register",
  ProductUpdate = "/form/product/update/",
  ProductStat = "/stats/product",
  AddressBook = "/addressbook",
  CheckOut = "/checkout",
}

/**
 * enum used for error message
 * TOKEN_EXPIRED: "Token Expired",
  EMPTY_CART: "Empty Cart",
  ZERO_QTY: "Zero Qty",
  FILE_ERROR: "File Error",
  FILE_NOT_FOUND: "File Not Found",
  INVALID_DIMENSION: "Invalid Dimension",
  PRODUCT_NOT_FOUND: "Product Not Found",
  INSUFFICIENT_QTY: "Insufficient Product Qty",
  PAYMENT_ERROR: "Payment Error",
  going to add these later
 */
export enum ErrorMessage {
  UNAURHOTIZED = "Unauthorized Access",
  TokenExpired = "Token Expired",
  ZeroQty = "Zero Qty",
  MaxQty = "Max Qty",
  FetchError = "Fetch Error",
  UNKNOWN_ERROR = "Unknown Error",
  INVALID_ID = "Invalid ID",
  INVALID_INPUT = "Invalid Input",
  INVALID_CART = "Invalid Cart",
  INVALID_TOKEN = "Invalid Token",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
  INVALID_DATA = "Invalid Data",
  INVALID_REQUEST = "Invalid Request",
}

/**
 * enum used for success message
 */
export enum SuccessMessage {
  UPDATE_SUCCESS = "Update Success",
  DELETE_SUCCESS = "Delete Success",
  UPLOAD_SUCCESS = "Upload Success",
  CREATE_SUCCESS = "Create Success",
}

// Name: Zay Yar Tun
