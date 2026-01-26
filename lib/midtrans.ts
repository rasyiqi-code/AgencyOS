import Midtrans from "midtrans-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const snap = new (Midtrans as any).Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
    clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const core = new (Midtrans as any).CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
    clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
});
