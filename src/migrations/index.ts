// Replaced by `pnpm migrate:create`. Kept so the config can import it before the first migration exists.
export const migrations: { name: string; up: (args: any) => Promise<void>; down: (args: any) => Promise<void> }[] = []
