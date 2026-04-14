import { ICartDetail } from "@/enums/cart-interfaces";
import { ICartLocalStorage } from "@/enums/global-interfaces";
export function showRemainingItem(maxQty: number) {
    if (maxQty <= 0) {
        return "Unavailable";
    }
    else if (maxQty === 1) {
        return "1 item left";
    }
    else if (maxQty <= 15) {
        return `${maxQty} items left`;
    }
    else {
        return "";
    }
}
export function extractColourData(data: ICartDetail): {
    colourid: number;
    colour: string;
}[] {
    const colourData = data.detail.reduce((arr, item) => {
        const index = arr.findIndex((a) => a.colourid === item.colourid);
        if (index === -1) {
            arr.push({ colourid: item.colourid, colour: item.colour });
        }
        return arr;
    }, [] as {
        colourid: number;
        colour: string;
    }[]);
    return colourData;
}
export function extractSizeData(data: ICartDetail, colourid: number): {
    sizeid: number;
    size: string;
}[] {
    const sizeData = data.detail
        .filter((d) => d.colourid === colourid)
        .reduce((arr, item) => {
        const index = arr.findIndex((a) => a.sizeid === item.sizeid);
        if (index === -1) {
            arr.push({ sizeid: item.sizeid, size: item.size });
        }
        return arr;
    }, [] as {
        sizeid: number;
        size: string;
    }[]);
    return sizeData;
}
export function removeDuplicateCartData(arr: ICartLocalStorage[], data?: ICartDetail[]) {
    const result: ICartLocalStorage[] = [];
    arr.forEach((item, i) => {
        const index = result.findIndex((r) => r.productdetailid === item.productdetailid);
        if (index !== -1) {
            if (data) {
                data = data.filter((d, j) => j !== i);
                const detail = data[index].detail.find((d) => d.productdetailid === result[index].productdetailid);
                if (detail) {
                    if (result[index].qty > detail.qty) {
                        result[index].qty = 1;
                    }
                }
            }
        }
        else {
            result.push({ ...item });
        }
    });
    return { cart: result, data: data };
}

