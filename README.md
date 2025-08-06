# Bug Described
When there's `anyOf` (e.g. [here](https://github.com/danaelhe/kiota_bug/blob/main/DigitalOcean-public.v2.yaml#L256)) of mixed types in OpenAPI 3.0 spec:
```
    components:
        parameters:
            ssh_key_identifier:
                in: path
                name: ssh_key_identifier
                required: true
                description: Either the ID or the fingerprint of an existing SSH key.
                schema:
                    anyOf:
                    - $ref: '#/components/schemas/ssh_key_id'
                    - $ref: '#/components/schemas/ssh_key_fingerprint'
                example: 512189


....
        schema:
            ssh_key_id:
                type: integer
                description: >-
                    A unique identification number for this key. Can be used to embed a 
                    specific SSH key into a Droplet.
                readOnly: true
                example: 512189
            
            ssh_key_fingerprint:
                type: string
                description: >-
                    A unique identifier that differentiates this key from other keys using 
                    a format that SSH recognizes. The fingerprint is created when the key is
                    added to your account.
                readOnly: true
                example: 3b:16:bf:e4:8b:00:8b:b8:59:8c:a9:d3:f0:19:45:fa
    
```

Kiota generates a function that only takes in the first type described (e.g. [here](https://github.com/danaelhe/kiota_bug/blob/main/src/dots/v2/account/keys/index.ts#L18)), in this case, an int:

```
export interface KeysRequestBuilder extends BaseRequestBuilder<KeysRequestBuilder> {
    /**
     * Gets an item from the ApiSdk.v2.account.keys.item collection
     * @param ssh_key_identifier Either the ID or the fingerprint of an existing SSH key.
     * @returns {WithSsh_key_identifierItemRequestBuilder}
     */
     bySsh_key_identifier(ssh_key_identifier: string) : WithSsh_key_identifierItemRequestBuilder;
}
```

When we would have expected:
```
export interface KeysRequestBuilder extends BaseRequestBuilder<KeysRequestBuilder> {
    /**
     * Gets an item from the ApiSdk.v2.account.keys.item collection
     * @param ssh_key_identifier Either the ID or the fingerprint of an existing SSH key.
     * @returns {WithSsh_key_identifierItemRequestBuilder}
     */
     bySsh_key_identifier(ssh_key_identifier: string | number) : WithSsh_key_identifierItemRequestBuilder;
}
```


# To Reproduce
To re-generate based on the `DigitalOcean-public.v2.yaml` spec, run:
```
make generate
```

