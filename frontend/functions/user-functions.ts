interface IAdminUser {
  userid: string;
  url: string;
  email: string;
  name: string;
  createdat: string;
  rolename: string;
  phone: string;
  building: string;
  street: string;
  unit_no: string;
  postal_code: string;
  region: string;
  status: string;
}
type IAdminUserFetch =
  | {
      data: IAdminUser[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

type IAdminDelete =
  | {
      data: number;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type IAdminUserCountFetch =
  | {
      data: number;
      error: null;
    }
  | {
      data: null;
      error: string;
    };
export type IAdminUserRevenueQuarterStat = {
      data: {
          gender: "F" | "M";
          quarter: "1" | "2" | "3" | "4";
          revenue: string;
          year: number;
      }[];
      error: null;
  } |
  {
      data: null;
      error: string;
  }

  export type IAdminUserMonthlyStat = {
    data: {
        gender: "F" | "M";
        month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
        revenue:string;
        year: number;
    }[];
    error: null;
} |
{
    data: null;
    error: string;
}

  export function getAdminUser(pageNo: number, limit: number): Promise<IAdminUserFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/user/admin?offset=${pageNo * limit}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminUserFetch;
      } else {
        return { data: result.data, error: null } as IAdminUserFetch;
      }
    });
}
export function getAdminUserCount(): Promise<IAdminUserCountFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/user/count/admin`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminUserCountFetch;
      } else {
        return { data: result.data, error: null } as IAdminUserCountFetch;
      }
    });
}


export function handleDeleteButton(userId: string): Promise<IAdminDelete> {
  return fetch(`${process.env.BACKEND_URL}/api/deleteUser/${userId}`, {
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

export function getAdminUserQuarterRevenueStat(year: number): Promise<IAdminUserRevenueQuarterStat> {
  return fetch(`${process.env.BACKEND_URL}/api/user/stat/revenue/quarter?year=${year}`, {
      method: 'GET',
      credentials: 'include'
  })
      .then((response) => response.json())
      .then((result) => {
          if (result.error) {
              return { data: null, error: result.error } as IAdminUserRevenueQuarterStat;
          }
          else {
              return { data: result.data, error: null } as IAdminUserRevenueQuarterStat;
          }
      })
}

export function getAdminUserMonthlyStat(year: number): Promise<IAdminUserMonthlyStat> {
  return fetch(`${process.env.BACKEND_URL}/api/user/stat/monthly?year=${year}`, {
    method: 'GET',
    credentials: 'include'
  })
  .then((response) => response.json())
  .then((result) => {
    if (result.error) {
      return { data: null, error: result.error } as IAdminUserMonthlyStat;
    } else {
      return { data: result.data, error: null } as IAdminUserMonthlyStat;
    }
  });
}
