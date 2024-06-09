export type TRole = "customer" | "agent";

export type TUser = {
    displayName: string
    role: TRole,
    id: string
}