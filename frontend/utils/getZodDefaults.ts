import { z } from "zod"

// https://github.com/colinhacks/zod/discussions/1953#discussioncomment-14098158
export function getZodDefaults<Schema extends z.ZodObject>(schema: Schema) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      return [key, value.unwrap().def.defaultValue]
    })
  )
}
