// Name: Angie
// Admin No:
// Class: DIT/FT/2B/02

import {  IAdminReviewCountFetch,  IAdminReviewFetch, IAdminDelete, IAdminReviewStat} from "@/enums/review-interfaces";

export async function getAdminReview(
  pageNo: number,
  limit: number
): Promise<IAdminReviewFetch> {
  return fetch(
    `${process.env.BACKEND_URL}/api/reviews/admin?offset=${
      pageNo * limit
    }&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminReviewFetch;
      } else {
        return { data: result.data, error: null } as IAdminReviewFetch;
      }
    });
}

export async function getAdminReviewCount(): Promise<IAdminReviewCountFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/reviews/count/admin`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminReviewCountFetch;
      } else {
        return { data: result.data, error: null } as IAdminReviewCountFetch;
      }
    });
}

export function handleDeleteButton(reviewID: number): Promise<IAdminDelete> {
    return fetch(`${process.env.BACKEND_URL}/api/deleteReview/${reviewID}`, {
      method: "PUT",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return { data: null, error: result.error } as IAdminDelete;
        } else {
          return { data: result.data, error: null } as IAdminDelete;
        }
      });
  }

export function getAdminReviewStat(year: number): Promise<IAdminReviewStat> {
  return fetch(
    `${process.env.BACKEND_URL}/api/review/stat/revenue/quarter?year=${year}`,
    {
      method: "GET",
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminReviewStat;
      } else {
        return { data: result.data, error: null } as IAdminReviewStat;
      }
    });
}

