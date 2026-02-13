import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module StockKey {
    public func compare(lhs : (Nat, Nat), rhs : (Nat, Nat)) : Order.Order {
      switch (Nat.compare(lhs.0, rhs.0)) {
        case (#equal) { Nat.compare(lhs.1, rhs.1) };
        case (notEqual) { notEqual };
      };
    };
  };

  public type PromotionType = {
    #percentageDiscount : { percentage : Float };
    #fixedDiscount : { amount : Int };
    #buyOneGetOne : {
      productId : Nat;
      variantId : Nat;
      discountProductId : Nat;
      discountVariantId : Nat;
      discountQuantity : Int;
    };
  };

  public type PromotionEligibility = {
    minPurchaseAmount : ?Int;
    validFrom : ?Int;
    validTo : ?Int;
    minQuantity : ?Int;
  };

  public type Promotion = {
    promoId : Nat;
    name : Text;
    promoType : PromotionType;
    productTarget : ?{ productId : Nat; variantId : ?Nat };
    eligibility : PromotionEligibility;
    description : ?Text;
    couponCode : ?Text;
    active : Bool;
    createdBy : ?Principal;
    createdAt : ?Int;
    updatedBy : ?Principal;
    updatedAt : ?Int;
  };

  public type PaymentMethodType = {
    #cash;
    #qrCode;
    #bankTransfer;
    #creditCard;
    #debitCard;
    #custom : Text;
  };

  public type PaymentMethod = {
    id : Nat;
    name : Text;
    methodType : PaymentMethodType;
    enabled : Bool;
  };

  public type ProductCategory = {
    id : Nat;
    name : Text;
    active : Bool;
  };

  public type ProductUnit = {
    id : Nat;
    name : Text;
    conversionToBase : Float;
  };

  public type ProductVariant = {
    id : Nat;
    name : Text;
    sku : Text;
    baseUnitId : Nat;
    retailPrice : Int;
    wholesalePrice : ?Int;
    cost : Int;
    active : Bool;
  };

  public type Product = {
    id : Nat;
    name : Text;
    categoryId : Nat;
    variants : [ProductVariant];
    active : Bool;
  };

  public type StockAdjustment = {
    productId : Nat;
    variantId : Nat;
    change : Int;
    reason : Text;
    timestamp : Int;
  };

  public type PaymentBreakdown = {
    methodId : Nat;
    amount : Int;
  };

  public type Transaction = {
    id : Nat;
    items : [{ productId : Nat; variantId : Nat; quantity : Int; unit : ProductUnit; price : Int }];
    payments : [PaymentBreakdown];
    totalAmount : Int;
    createdBy : Principal;
    timestamp : Int;
    refundedAmount : Int;
    status : TransactionStatus;
  };

  public type TransactionStatus = {
    #completed;
    #partiallyRefunded : { refundedAmount : Int; originalAmount : Int };
    #fullyRefunded;
    #voided : { voidedBy : Principal; timestamp : Int };
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let paymentMethods = Map.empty<Nat, PaymentMethod>();
  let categories = Map.empty<Nat, ProductCategory>();
  let products = Map.empty<Nat, Product>();
  let stock = Map.empty<(Nat, Nat), Int>();
  let stockAdjustments = List.empty<StockAdjustment>();
  let transactions = Map.empty<Nat, Transaction>();
  let promotions = Map.empty<Nat, Promotion>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextId : Nat = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type SaveProductCategoryInput = {
    name : Text;
    active : Bool;
  };

  type SaveProductInput = {
    name : Text;
    categoryId : Nat;
    variants : [ProductVariant];
    active : Bool;
  };

  type SavePaymentMethodInput = {
    name : Text;
    methodType : PaymentMethodType;
    enabled : Bool;
  };

  type SaveProductVariantInput = {
    name : Text;
    productId : Nat;
    baseUnitId : Nat;
    retailPrice : Int;
    wholesalePrice : ?Int;
    cost : Int;
    active : Bool;
  };

  type CreateTransactionInput = {
    items : [{ productId : Nat; variantId : Nat; quantity : Int; unit : ProductUnit; price : Int }];
    payments : [PaymentBreakdown];
    totalAmount : Int;
  };

  func genId() : Nat {
    nextId += 1;
    nextId;
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product category management - Admin only
  public shared ({ caller }) func saveProductCategory(input : SaveProductCategoryInput) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let category = {
      id = genId();
      name = input.name;
      active = input.active;
    };
    categories.add(category.id, category);
    category.id;
  };

  // Product management - Admin only
  public shared ({ caller }) func saveProduct(input : SaveProductInput) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let newProduct : Product = {
      id = genId();
      name = input.name;
      categoryId = input.categoryId;
      variants = input.variants;
      active = input.active;
    };

    products.add(newProduct.id, newProduct);
    newProduct.id;
  };

  // Product variant management - Admin only
  public shared ({ caller }) func addProductVariant(variant : SaveProductVariantInput) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create product variants");
    };

    switch (products.get(variant.productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        let newVariant : ProductVariant = {
          id = genId();
          name = variant.name;
          sku = genSkuVariant(variant.productId, variant.name);
          baseUnitId = variant.baseUnitId;
          retailPrice = variant.retailPrice;
          wholesalePrice = variant.wholesalePrice;
          cost = variant.cost;
          active = variant.active;
        };
        let newVariants = product.variants.concat([newVariant]);
        products.add(variant.productId, { product with variants = newVariants });
        newVariant.id;
      };
    };
  };

  // Payment method management - Admin only
  public shared ({ caller }) func savePaymentMethod(input : SavePaymentMethodInput) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create payment methods");
    };

    let newPaymentMethod : PaymentMethod = {
      id = genId();
      name = input.name;
      methodType = input.methodType;
      enabled = input.enabled;
    };

    paymentMethods.add(newPaymentMethod.id, newPaymentMethod);
    newPaymentMethod.id;
  };

  // Inventory adjustment - Admin only
  public shared ({ caller }) func createInventoryAdjustment(adjustment : StockAdjustment) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can adjust inventory");
    };

    let key = (adjustment.productId, adjustment.variantId);
    let currentStock = switch (stock.get(key)) {
      case (null) { 0 };
      case (?quantity) { quantity };
    };

    let newStock = currentStock + adjustment.change;
    stock.add(key, newStock);
    stockAdjustments.add(adjustment);
  };

  // Transaction queries - User level (cashiers need access)
  public query ({ caller }) func getTransactionsByPaymentMethod(methodId : Nat) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let transactionsIter = transactions.values();
    let filtered = transactionsIter.filter(
      func(t : Transaction) : Bool {
        t.payments.any<PaymentBreakdown>(func(p) { p.methodId == methodId });
      }
    );
    filtered.toArray();
  };

  // Product queries - User level (cashiers need to see products)
  public query ({ caller }) func getProductVariantsByProduct(productId : Nat) : async [ProductVariant] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view product variants");
    };
    switch (products.get(productId)) {
      case (null) { [] };
      case (?product) { product.variants };
    };
  };

  // Get all transactions sorted by timestamp - descending
  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let sorted = transactions.values().toArray().sort(
      func(a, b) {
        if (a.timestamp > b.timestamp) {
          return #less;
        } else if (a.timestamp < b.timestamp) {
          return #greater;
        };
        #equal;
      }
    );
    sorted;
  };

  // Payment method queries - User level
  public query ({ caller }) func getPaymentMethodsByType(methodType : PaymentMethodType) : async [PaymentMethod] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment methods");
    };
    let iter = paymentMethods.values();
    let filteredIter = iter.filter(func(m) { m.methodType == methodType });
    filteredIter.toArray();
  };

  func isRefundExpired(timestamp : Int) : Bool {
    let refundExpirationTime = 30 * 24 * 60 * 60 * 1_000_000_000;
    let currentTime = Time.now();
    let daysSincePurchase = (currentTime - timestamp) / 1_000_000_000 / 3600 / 24;
    daysSincePurchase > refundExpirationTime;
  };

  // Refund processing - Admin only
  public shared ({ caller }) func processRefund(originalTransactionId : Nat, refundMethodId : Nat, _amount : Int) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can process refunds");
    };

    switch (transactions.get(originalTransactionId)) {
      case (null) { Runtime.trap("Original transaction not found") };
      case (?originalTransaction) {
        if (isRefundExpired(originalTransaction.timestamp)) {
          Runtime.trap("Refund expired - original transaction too old");
        };
      };
    };
  };

  // Payment data - Admin only (sensitive financial data)
  public query ({ caller }) func getAllPayments() : async [PaymentBreakdown] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all payment data");
    };
    var paymentList = List.empty<PaymentBreakdown>();
    let transactionsIter = transactions.values();
    for (transaction in transactionsIter) {
      for (payment in transaction.payments.vals()) {
        paymentList.add(payment);
      };
    };
    paymentList.toArray();
  };

  // Promotion queries - Sort by percentage discount
  public query ({ caller }) func getComboDeals() : async [Promotion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch promotions");
    };

    let filtered = promotions.values().toArray().filter(
      func(p) {
        switch (p.promoType) {
          case (#buyOneGetOne(_)) { true };
          case (_) { false };
        };
      }
    );

    filtered.sort(
      func(a, b) {
        var discountA = 0.0;
        var discountB = 0.0;
        switch (a.promoType) {
          case (#percentageDiscount({ percentage })) { discountA := percentage };
          case (_) {};
        };
        switch (b.promoType) {
          case (#percentageDiscount({ percentage })) { discountB := percentage };
          case (_) {};
        };
        if (discountA > discountB) {
          return #less;
        } else if (discountA < discountB) {
          return #greater;
        };
        #equal;
      }
    );
  };

  // Fetch all active categories for product dropdown
  public query ({ caller }) func getCategoryList(_search : ?Text) : async [ProductCategory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access category list");
    };
    categories.values().toArray().filter(func(c) { c.active });
  };

  // Update transactions for completed sales as atomic operation (stock must be decremented)
  public shared ({ caller }) func createTransaction(input : CreateTransactionInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };

    // Check stock using array iteration (force sequentialization vs. core iter logic)
    let hasInsufficientStock = input.items.any(
      func(item) {
        let key = (item.productId, item.variantId);
        let currentStock = switch (stock.get(key)) {
          case (null) { 0 };
          case (?quantity) { quantity };
        };
        currentStock < item.quantity;
      }
    );

    if (hasInsufficientStock) {
      Runtime.trap("Insufficient stock quantity for one or more items");
    };

    let newTransaction : Transaction = {
      id = genId();
      items = input.items;
      payments = input.payments;
      totalAmount = input.totalAmount;
      createdBy = caller;
      timestamp = Time.now();
      refundedAmount = 0;
      status = #completed;
    };

    // Decrement stock atomically
    for (item in input.items.vals()) {
      let key = (item.productId, item.variantId);
      let currentStock = switch (stock.get(key)) {
        case (null) { 0 };
        case (?quantity) { quantity };
      };
      let newStock = currentStock - item.quantity;
      stock.add(key, newStock);
    };

    transactions.add(newTransaction.id, newTransaction);

    newTransaction.id;
  };

  func genSkuVariant(productId : Nat, _variant : Text) : Text {
    let variantChar = Nat.min(productId % 36, 35).toText();
    variantChar # "-" # productId.toText();
  };
};
