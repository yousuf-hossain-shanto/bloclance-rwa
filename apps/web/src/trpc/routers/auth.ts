import { createTRPCRouter, publicProcedure } from "../init";

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    return {
      user: ctx.user,
      kycStatus: ctx.user.kycStatus,
    };
  }),
});
