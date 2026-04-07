// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

import { TProductList, TProductListCount } from "@/enums/admin-product-interfaces";
import { IProduct, IDeleteFetch, IProductDetailSubmit, ICreateFetch, IUpdateFetch, IProductUpdate, IAdminProductQuarterStat, IAdminProductMonthlyStat } from "@/enums/admin-product-interfaces";
export function getProductList(pageNo: number, limit: number): Promise<TProductList> {
  return fetch(`${process.env.BACKEND_URL}/api/product/admin?offset=${pageNo * limit}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        console.error(result.error);
        return { data: null, error: result.error } as TProductList;
      } else {
        return { data: result.data, error: null } as TProductList;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: error } as TProductList;
    });
}

export function getProductListCount(): Promise<TProductListCount> {
  return fetch(`${process.env.BACKEND_URL}/api/product/count/admin`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        console.error(result.error);
        return { data: null, error: result.error } as TProductListCount;
      } else {
        return { data: result.data, error: null } as TProductListCount;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: error } as TProductListCount;
    });
}


export async function createProduct(product:IProduct){
  console.log("INSIDE createProduct")
  return fetch(`${process.env.BACKEND_URL}/api/productAdmin`, {
    method: "POST",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        return { data: result, error: null } as ICreateFetch;
      } else {
        return { data: null, error: "Unknown Error" } as ICreateFetch;
      }
    });
}

export async function updateProduct(product:IProductUpdate){
  console.log("INSIDE createProduct")
  return fetch(`${process.env.BACKEND_URL}/api/productAdmin`, {
    method: "PUT",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        return { data: result, error: null } as IUpdateFetch;
      } else {
        return { data: null, error: "Unknown Error" } as IUpdateFetch;
      }
    });
}

export async function deleteProduct(productid:string){
  console.log("INSIDE deleteProduct")
  return fetch(`${process.env.BACKEND_URL}/api/productAdmin`, {
    method: "DELETE",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({productid: productid}),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        return { data: result, error: null } as IDeleteFetch;
      } else {
        return { data: null, error: "Unknown Error" } as IDeleteFetch;
      }
    });
}


export async function deleteProductDetail(productdetailid:string){
  console.log("INSIDE deleteProductDetail")
  return fetch(`${process.env.BACKEND_URL}/api/deleteProductDetail?productdetailid=${productdetailid}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result)
      if (result.error) {
        return { data: null, error: result.error } as IDeleteFetch;
      } else {
        return { data: result, error: null } as IDeleteFetch;
      }
    });
}

export async function createProductDetail(productdetail:IProductDetailSubmit){
  console.log("INSIDE createProductDetail")
  return fetch(`${process.env.BACKEND_URL}/api/productDetailAdmin`, {
    method: "POST",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productdetail),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: "Unknown Error" } as ICreateFetch;
      } else {
        return { data: result, error: null } as ICreateFetch;
      }
    });
}

export async function updateProductDetailQuantity(productdetail:{productdetailid: string, quantity: string}){
  console.log("INSIDE createProductDetail")
  return fetch(`${process.env.BACKEND_URL}/api/productDetailAdmin`, {
    method: "PUT",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productdetail),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: "Unknown Error" } as ICreateFetch;
      } else {
        return { data: result, error: null } as ICreateFetch;
      }
    });
}

export function getAdminProductQuarterStat(year: number): Promise<IAdminProductQuarterStat> {
  return fetch(`${process.env.BACKEND_URL}/api/product/stat/quarter?year=${year}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminProductQuarterStat;
      } else {
        return { data: result.data, error: null } as IAdminProductQuarterStat;
      }
    });
}


export function getAdminProductMonthlyStat(year: number): Promise<IAdminProductMonthlyStat> {
  return fetch(`${process.env.BACKEND_URL}/api/product/stat/monthly?year=${year}`, {
    method: 'GET',
    credentials: 'include'
  })
  .then((response) => response.json())
  .then((result) => {
    if (result.error) {
      return { data: null, error: result.error } as IAdminProductMonthlyStat;
    } else {
      return { data: result.data, error: null } as IAdminProductMonthlyStat;
    }
  });
}
