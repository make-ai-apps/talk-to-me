
export function formatPrice(currency: string, unit_amount: number) {
    const price = new Intl.NumberFormat(
        "en-Us", {
        style: "currency",
        currency: currency!,
        minimumFractionDigits: 0
    }
    ).format((unit_amount || 0) / 100)
    return price
}