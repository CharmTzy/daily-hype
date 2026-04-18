import { ErrorMessage } from "@/enums/global-enums";
import {
    IAdminDelete,
    IAdminReviewCountFetch,
    IAdminReviewFetch,
    IAdminReviewStat,
    TCustomerReviewDetailFetch,
    TCustomerReviewFetch,
    TDeleteReview,
    TProductReviewFetch,
    TReviewMutation,
} from "@/enums/review-interfaces";

export async function getAdminReview(pageNo: number, limit: number): Promise<IAdminReviewFetch> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/reviews/admin?offset=${pageNo * limit}&limit=${limit}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { data: null, error: result.error } as IAdminReviewFetch;
        }

        return { data: result.data || [], error: null } as IAdminReviewFetch;
    } catch (error) {
        console.error(error);
        return { data: null, error: ErrorMessage.FetchError } as IAdminReviewFetch;
    }
}

export async function getAdminReviewCount(): Promise<IAdminReviewCountFetch> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/reviews/count/admin`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { data: null, error: result.error } as IAdminReviewCountFetch;
        }

        return { data: result.data, error: null } as IAdminReviewCountFetch;
    } catch (error) {
        console.error(error);
        return { data: null, error: ErrorMessage.FetchError } as IAdminReviewCountFetch;
    }
}

export async function handleDeleteButton(reviewID: number): Promise<IAdminDelete> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/deleteReview/${reviewID}`, {
            method: "DELETE",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { data: null, error: result.error } as IAdminDelete;
        }

        return { data: reviewID, error: null } as IAdminDelete;
    } catch (error) {
        console.error(error);
        return { data: null, error: ErrorMessage.FetchError } as IAdminDelete;
    }
}

export async function getAdminReviewStat(year: number): Promise<IAdminReviewStat> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/review/stat/revenue/quarter?year=${year}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { data: null, error: result.error } as IAdminReviewStat;
        }

        return { data: result.data, error: null } as IAdminReviewStat;
    } catch (error) {
        console.error(error);
        return { data: null, error: ErrorMessage.FetchError } as IAdminReviewStat;
    }
}

export async function getProductReviews(productID: number): Promise<TProductReviewFetch> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/review/${productID}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { data: null, error: result.error } as TProductReviewFetch;
        }

        return { data: result.review || [], error: null } as TProductReviewFetch;
    } catch (error) {
        console.error(error);
        return { data: null, error: ErrorMessage.FetchError } as TProductReviewFetch;
    }
}

export async function getCustomerReviews(): Promise<TCustomerReviewFetch> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/getAllReviews`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { data: null, error: result.error } as TCustomerReviewFetch;
        }

        return { data: result.reviews || [], error: null } as TCustomerReviewFetch;
    } catch (error) {
        console.error(error);
        return { data: null, error: ErrorMessage.FetchError } as TCustomerReviewFetch;
    }
}

export async function getCustomerReview(reviewID: number): Promise<TCustomerReviewDetailFetch> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/getReview/${reviewID}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { review: null, error: result.error } as TCustomerReviewDetailFetch;
        }

        return { review: result.review || null, error: null } as TCustomerReviewDetailFetch;
    } catch (error) {
        console.error(error);
        return { review: null, error: ErrorMessage.FetchError } as TCustomerReviewDetailFetch;
    }
}

export async function getCustomerReviewByOrderItem(
    orderID: number,
    productDetailID: number,
): Promise<TCustomerReviewDetailFetch> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/reviews/order/${orderID}/${productDetailID}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { review: null, error: result.error } as TCustomerReviewDetailFetch;
        }

        return { review: result.review || null, error: null } as TCustomerReviewDetailFetch;
    } catch (error) {
        console.error(error);
        return { review: null, error: ErrorMessage.FetchError } as TCustomerReviewDetailFetch;
    }
}

export async function createCustomerReview(
    orderID: number,
    productDetailID: number,
    rating: number,
    reviewDescription: string,
): Promise<TReviewMutation> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/createReview`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderID,
                productDetailID,
                rating,
                reviewDescription,
            }),
        });
        const result = await response.json();

        if (result.error) {
            return { message: null, review: null, error: result.error } as TReviewMutation;
        }

        return {
            message: result.message,
            review: result.review,
            error: null,
        } as TReviewMutation;
    } catch (error) {
        console.error(error);
        return { message: null, review: null, error: ErrorMessage.FetchError } as TReviewMutation;
    }
}

export async function updateCustomerReview(
    reviewID: number,
    rating: number,
    reviewDescription: string,
): Promise<TReviewMutation> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/updateReview/${reviewID}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                rating,
                reviewDescription,
            }),
        });
        const result = await response.json();

        if (result.error) {
            return { message: null, review: null, error: result.error } as TReviewMutation;
        }

        return {
            message: result.message,
            review: result.review,
            error: null,
        } as TReviewMutation;
    } catch (error) {
        console.error(error);
        return { message: null, review: null, error: ErrorMessage.FetchError } as TReviewMutation;
    }
}

export async function deleteCustomerReview(reviewID: number): Promise<TDeleteReview> {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/deleteReview/${reviewID}`, {
            method: "DELETE",
            credentials: "include",
        });
        const result = await response.json();

        if (result.error) {
            return { message: null, error: result.error } as TDeleteReview;
        }

        return { message: result.message, error: null } as TDeleteReview;
    } catch (error) {
        console.error(error);
        return { message: null, error: ErrorMessage.FetchError } as TDeleteReview;
    }
}

