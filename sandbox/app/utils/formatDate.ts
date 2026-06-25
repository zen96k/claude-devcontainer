import { format } from "@formkit/tempo"

export const formatDate = ({ date }: { date: string | Date }) => {
  return format(new Date(date), "YYYY-MM-DD HH:mm:ss")
}
