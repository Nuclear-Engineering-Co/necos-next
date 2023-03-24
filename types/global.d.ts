declare type Configuration = {
    guild_id: string
    verification_enabled: number
    moderator_roles: string
    created_at: Date
    updated_at: Date
}

declare type Role = {
    id: number
    name: string
    position: number
}

declare type GameServer = {
    job_id: string
    is_vip: number
    players: string
    last_ping: number
    created_at: Date
    updated_at: Date
}

declare type User = {
    id: number
    username: string
    user_id: string
    discord_id?: string
    password?: string
    role: string
    created_at: Date
    updated_at: Date
}

declare type VerificationRoleBind = {
    id: number
    guild_id: string
    role_id: string
    role_data: string
    created_at: Date
    updated_at: Date
}