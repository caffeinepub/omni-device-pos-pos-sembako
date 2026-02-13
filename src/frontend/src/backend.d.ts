import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type TransactionStatus = {
    __kind__: "fullyRefunded";
    fullyRefunded: null;
} | {
    __kind__: "partiallyRefunded";
    partiallyRefunded: {
        originalAmount: bigint;
        refundedAmount: bigint;
    };
} | {
    __kind__: "completed";
    completed: null;
} | {
    __kind__: "voided";
    voided: {
        voidedBy: Principal;
        timestamp: bigint;
    };
};
export interface Promotion {
    couponCode?: string;
    active: boolean;
    name: string;
    createdAt?: bigint;
    createdBy?: Principal;
    description?: string;
    eligibility: PromotionEligibility;
    promoType: PromotionType;
    updatedAt?: bigint;
    updatedBy?: Principal;
    productTarget?: {
        productId: bigint;
        variantId?: bigint;
    };
    promoId: bigint;
}
export interface PaymentMethod {
    id: bigint;
    methodType: PaymentMethodType;
    name: string;
    enabled: boolean;
}
export interface StockAdjustment {
    productId: bigint;
    variantId: bigint;
    timestamp: bigint;
    change: bigint;
    reason: string;
}
export type PaymentMethodType = {
    __kind__: "creditCard";
    creditCard: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "cash";
    cash: null;
} | {
    __kind__: "bankTransfer";
    bankTransfer: null;
} | {
    __kind__: "debitCard";
    debitCard: null;
} | {
    __kind__: "qrCode";
    qrCode: null;
};
export interface ProductVariant {
    id: bigint;
    sku: string;
    active: boolean;
    retailPrice: bigint;
    baseUnitId: bigint;
    cost: bigint;
    name: string;
    wholesalePrice?: bigint;
}
export interface Transaction {
    id: bigint;
    status: TransactionStatus;
    refundedAmount: bigint;
    payments: Array<PaymentBreakdown>;
    createdBy: Principal;
    totalAmount: bigint;
    timestamp: bigint;
    items: Array<{
        unit: ProductUnit;
        productId: bigint;
        variantId: bigint;
        quantity: bigint;
        price: bigint;
    }>;
}
export interface SavePaymentMethodInput {
    methodType: PaymentMethodType;
    name: string;
    enabled: boolean;
}
export interface ProductUnit {
    id: bigint;
    name: string;
    conversionToBase: number;
}
export type PromotionType = {
    __kind__: "percentageDiscount";
    percentageDiscount: {
        percentage: number;
    };
} | {
    __kind__: "buyOneGetOne";
    buyOneGetOne: {
        discountVariantId: bigint;
        productId: bigint;
        discountQuantity: bigint;
        variantId: bigint;
        discountProductId: bigint;
    };
} | {
    __kind__: "fixedDiscount";
    fixedDiscount: {
        amount: bigint;
    };
};
export interface PromotionEligibility {
    validFrom?: bigint;
    validTo?: bigint;
    minPurchaseAmount?: bigint;
    minQuantity?: bigint;
}
export interface PaymentBreakdown {
    methodId: bigint;
    amount: bigint;
}
export interface SaveProductCategoryInput {
    active: boolean;
    name: string;
}
export interface SaveProductInput {
    categoryId: bigint;
    active: boolean;
    name: string;
    variants: Array<ProductVariant>;
}
export interface SaveProductVariantInput {
    active: boolean;
    retailPrice: bigint;
    baseUnitId: bigint;
    cost: bigint;
    name: string;
    wholesalePrice?: bigint;
    productId: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface ProductCategory {
    id: bigint;
    active: boolean;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProductVariant(variant: SaveProductVariantInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createInventoryAdjustment(adjustment: StockAdjustment): Promise<void>;
    getAllPayments(): Promise<Array<PaymentBreakdown>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryList(_search: string | null): Promise<Array<ProductCategory>>;
    getComboDeals(): Promise<Array<Promotion>>;
    getPaymentMethodsByType(methodType: PaymentMethodType): Promise<Array<PaymentMethod>>;
    getProductVariantsByProduct(productId: bigint): Promise<Array<ProductVariant>>;
    getTransactionsByPaymentMethod(methodId: bigint): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    processRefund(originalTransactionId: bigint, refundMethodId: bigint, _amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    savePaymentMethod(input: SavePaymentMethodInput): Promise<bigint>;
    saveProduct(input: SaveProductInput): Promise<bigint>;
    saveProductCategory(input: SaveProductCategoryInput): Promise<bigint>;
}
