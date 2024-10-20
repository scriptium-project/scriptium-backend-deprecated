import { z } from "zod";

export const readNotificationsSchema = z.object({
  notificationIds: z.array(z.number().int().min(1)).nonempty(),
});
