// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

import { TBestSellingByLimit, ICategoryFetch, IColourFetch, IProductFilterCountFetch, IProductFilterFetch, ISizeFetch, ITypeFetch, TLatestProductsByLimit, IOptionsFetch, IProduct, IProductDetailFetch, IDeleteFetch, IProductDetailSubmit, ICreateFetch, IUpdateFetch, IProductUpdate } from "@/enums/product-interfaces";

export async function getProductFilterCount(types: number[], colours: number[], sizes: number[], categories: number[]): Promise<IProductFilterCountFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/product/detail/count?type=${types.join(",")}&colour=${colours.join(",")}&size=${sizes.join(",")}&category=${categories.join(",")}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IProductFilterCountFetch;
      } else {
        return { data: result.data, error: null } as IProductFilterCountFetch;
      }
    });
}

export async function getProductFilter(types: number[], colours: number[], sizes: number[], categories: number[], limit: number, offset: number): Promise<IProductFilterFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/product/detail?type=${types.join(",")}&colour=${colours.join(",")}&size=${sizes.join(",")}&category=${categories.join(",")}&offset=${offset}&limit=${limit}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IProductFilterFetch;
      } else {
        return { data: result.data, error: null } as IProductFilterFetch;
      }
    });
}

export async function getFilterOptions(): Promise<IOptionsFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/filterOptions`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        return { data: result, error: null } as IOptionsFetch;
      } else {
        return { data: null, error: "Unknown Error" } as IOptionsFetch;
      }
    });
}

export async function getProductAndDetail(productid: string) {
  console.log("INSIDE getProductAndDetail");
  return fetch(`${process.env.BACKEND_URL}/api/productAndDetail?productid=${productid}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      if (result) {
        return { data: result.productdetail, error: null } as IProductDetailFetch;
      } else {
        return { data: null, error: "Unknown Error" } as IProductDetailFetch;
      }
    });
}


/**
 * get the unique product types
 * @returns Promise(object) - {data, error}
 * @returns data - array of objects [{}]
 * @returns error - string
 * @example
 * getTypes().then((result) => {
 *    if(result.error) {
 *        // implement error logic here
 *    }
 *    else {
 *        // implement data logic here
 *    }
 * })
 */
export async function getTypes(): Promise<ITypeFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/product/types`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        alert(result.error);
        return { data: null, error: result.error } as ITypeFetch;
      } else {
        return { data: result.data, error: null } as ITypeFetch;
      }
    });
}

/**
 * get the unique product categories
 * @returns Promsie(object) - {data, error}
 *
 */
export async function getCategories(): Promise<ICategoryFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/product/categories`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        alert(result.error);
        return { data: null, error: result.error } as ICategoryFetch;
      } else {
        return { data: result.data, error: null } as ICategoryFetch;
      }
    });
}

/**
 *
 * @returns Promise(object) - {data, error}
 */
export async function getColours(): Promise<IColourFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/product/colours`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        alert(result.error);
        return { data: null, error: result.error } as IColourFetch;
      } else {
        return { data: result.data, error: null } as IColourFetch;
      }
    });
}

/**
 *
 * @returns Promise(object) - {data, error}
 */
export async function getSizes(): Promise<ISizeFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/product/sizes`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        alert(result.error);
        return { data: null, error: result.error } as ISizeFetch;
      } else {
        return { data: result.data, error: null } as ISizeFetch;
      }
    });
}

// Name: Zay Yar Tun

/**
 * get the latest products by limit
 * @param limit a number for the number of latest products (must be greater than 0)
 * @returns TLatestProductsByLimit
 */
export async function getLatestProductsByLimit(limit: number): Promise<TLatestProductsByLimit> {
  return fetch(`${process.env.BACKEND_URL}/api/product/latest?limit=${limit}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TLatestProductsByLimit;
      } else {
        return { data: result.data, error: null } as TLatestProductsByLimit;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: error } as TLatestProductsByLimit;
    });
}

/**
 *
 * @param limit a number for the number of best selling products (must be greater than 0)
 * @returns TBestSellingByLimit
 */
export async function getBestSellingByLimit(limit: number): Promise<TBestSellingByLimit> {
  return fetch(`${process.env.BACKEND_URL}/api/product/bestselling?limit=${limit}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TBestSellingByLimit;
      } else {
        return { data: result.data, error: null } as TBestSellingByLimit;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: error } as TBestSellingByLimit;
    });
}

// Name: Zay Yar Tun
