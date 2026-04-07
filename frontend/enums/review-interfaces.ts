export interface IAdminReview {
    reviewid: number;
    name: string;
    productname: string;
    rating: number;
    reviewdescription: string;
    urls: string[] | null[];
}

export type IAdminReviewCountFetch = {
    data: number;
    error: null;
} |
{
    data: null;
    error: string;
}

export type IAdminReviewFetch = {
    data: IAdminReview[];
    error: null;
}
    |
{
    data: null;
    error: string;
}

export type IAdminDelete =
  | {
      data: number;
      error: null;
    }
  | {
      data: null;
      error: string;
    };
    
export type IAdminReviewStat =
  | {
      data: {
        rating: "1" | "2" | "3" | "4" | "5";
        year: number;
      }[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };