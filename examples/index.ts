import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import { createDigitalOceanClient } from "../src/dots/digitalOceanClient.js";
import { DigitalOceanApiKeyAuthenticationProvider } from '../src/dots/DigitalOceanApiKeyAuthenticationProvider.js';


const token = process.env.DIGITALOCEAN_TOKEN;
if (!token) {
    throw new Error("DIGITALOCEAN_TOKEN not set");
}

const authProvider = new DigitalOceanApiKeyAuthenticationProvider(token!);
// Create request adapter using the fetch-based implementation
const adapter = new FetchRequestAdapter(authProvider);
// Create the API client
const client = createDigitalOceanClient(adapter);

async function main(): Promise<void> {
    try {
        // Example 1: Get SSH key by ID
        console.log("=== Getting SSH key by ID ===");
        const sshKeyIdStr = process.env.SSH_KEY_ID || "512189"; // Example ID
        const sshKeyId = parseInt(sshKeyIdStr, 10);
        
        if (isNaN(sshKeyId)) {
            console.error("SSH_KEY_ID must be a valid number");
            return;
        }
        
        try {
            const keyById = await client.v2.account.keys.bySsh_key_identifier(sshKeyId).get();
            if (keyById && keyById.sshKey) {
                console.log(`SSH Key by ID: ${keyById.sshKey.name} (${keyById.sshKey.fingerprint})`);
                console.log(`Public Key: ${keyById.sshKey.publicKey?.substring(0, 50)}...`);
            }
        } catch (err) {
            console.error(`Failed to get SSH key by ID: ${err}`);
        }

        // Example 2: Update SSH key name using ID
        console.log("\n=== Updating SSH key name ===");
        try {
            const updateRequest = {
                name: "Updated SSH Key Name - " + new Date().toISOString()
            };
            const updatedKey = await client.v2.account.keys.bySsh_key_identifier(sshKeyId).put(updateRequest);
            if (updatedKey && updatedKey.sshKey) {
                console.log(`Updated SSH key name: ${updatedKey.sshKey.name}`);
            }
        } catch (err) {
            console.error(`Failed to update SSH key: ${err}`);
        }

        // Example 3: Get the updated SSH key to verify the change
        console.log("\n=== Verifying the updated SSH key ===");
        try {
            const verifyKey = await client.v2.account.keys.bySsh_key_identifier(sshKeyId).get();
            if (verifyKey && verifyKey.sshKey) {
                console.log(`Verified SSH key name: ${verifyKey.sshKey.name}`);
                console.log(`SSH key ID: ${verifyKey.sshKey.id}`);
                console.log(`SSH key fingerprint: ${verifyKey.sshKey.fingerprint}`);
            }
        } catch (err) {
            console.error(`Failed to verify SSH key: ${err}`);
        }

        console.log("\nDone!");

    } catch (err) {
        console.error("Main function error:", err);
    }
}

main();