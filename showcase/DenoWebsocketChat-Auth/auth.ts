export async function login(username: string, password: string): Promise<void> {
    const responseRaw = await fetch(`${Deno.env.get("REPLIT_DB_URL")}/${username}`)
    const response = await responseRaw.text()

    if (response == password) { // Convert types if required
        return
    } else {
        throw "Invalid username/password"
    }
}

export async function signUp(username: string, password: string): Promise<void> {
    const responseRaw = await fetch(`${Deno.env.get("REPLIT_DB_URL")}/${username}`)

    if (responseRaw.status === 404) {
        const signupReq = await fetch(Deno.env.get("REPLIT_DB_URL")!, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: username + "=" + password
        })
        if (signupReq.status !== 200) {
            throw "Unknown error occurred"
        }
    } else {
        throw "User already exists"
    }
}