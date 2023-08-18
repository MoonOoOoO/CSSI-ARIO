import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";

@Injectable()
export class EncrDecrService {
    constructor() {}

    //The set method is use for encrypt the value.
    set(value: string, key: string) {
        var iv = CryptoJS.enc.Utf8.parse(key.substr(0, 8));
        key = CryptoJS.enc.Utf8.parse(key);
        var encrypted = CryptoJS.TripleDES.encrypt(value, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    }

    //The get method is use for decrypt the value.
    get(key: string, value: string) {
        var iv = CryptoJS.enc.Utf8.parse(key.substr(0, 8));
        key = CryptoJS.enc.Utf8.parse(key);
        const decrypted = CryptoJS.TripleDES.decrypt(value, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    encrypt(value: string) {
        return CryptoJS.SHA256(CryptoJS.MD5(value).toString()).toString();
    }
}
