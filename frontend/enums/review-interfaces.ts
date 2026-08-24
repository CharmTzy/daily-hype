import { ErrorMessage, SuccessMessage } from "./global-enums";

export interface IAdminReview {
    reviewid: number;
    name: string;
    profileurl: string;
    productname: string;
    rating: number;
    reviewdescription: string;
    urls: Array<string | null>;
}

export interface IProductReview {
    reviewid: number;
    name: string;
    profileurl: string;
    rating: number;
    reviewdescription: string;
    urls: Array<string | null>;
    createdat: string;
    updatedat: string;
    colorname: string;
    sizename: string;
}

export interface ICustomerReview {
    name: string;
    reviewid: number;
    rating: number;
    reviewdescription: string;
    createdat: string;
    updatedat: string;
    productname: string;
    productid: number;
    productdetailid: number;
    orderid: string;
    colourname: string;
    sizename: string;
    urls: Array<string | null>;
}

export interface ICustomerReviewDetail {
    reviewid: number;
    rating: number;
    reviewdescription: string;
    userid: number;
    productid: number;
    createdat: string;
    updatedat: string;
    productdetailid: number;
    orderid: string;
}

export type IAdminReviewCountFetch = {
    data: number;
    error: null;
} | {
    data: null;
    error: string;
};

export type IAdminReviewFetch = {
    data: IAdminReview[];
    error: null;
} | {
    data: null;
    error: string;
};

export type IAdminDelete = {
    data: number;
    error: null;
} | {
    data: null;
    error: string;
};

export type IAdminReviewStat = {
    data: {
        rating: "1" | "2" | "3" | "4" | "5";
        year: number;
    }[];
    error: null;
} | {
    data: null;
    error: string;
};

export type TProductReviewFetch = {
    data: IProductReview[];
    error: null;
} | {
    data: null;
    error: string | ErrorMessage;
};

export interface IProductReviewStats {
    total: number;
    average: number;
    countsByRating: { star: number; count: number }[];
}

export type TProductReviewStatsFetch = {
    data: IProductReviewStats;
    error: null;
} | {
    data: null;
    error: string | ErrorMessage;
};

export type TCustomerReviewFetch = {
    data: ICustomerReview[];
    error: null;
} | {
    data: null;
    error: string | ErrorMessage;
};

export type TCustomerReviewDetailFetch = {
    review: ICustomerReviewDetail | null;
    error: null;
} | {
    review: null;
    error: string | ErrorMessage;
};

export type TReviewMutation = {
    message: SuccessMessage;
    review: ICustomerReviewDetail;
    error: null;
} | {
    message: null;
    review: null;
    error: string | ErrorMessage;
};

export type TDeleteReview = {
    message: SuccessMessage;
    error: null;
} | {
    message: null;
    error: string | ErrorMessage;
};
