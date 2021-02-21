import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { AuthService } from "./auth.service";

@Injectable()

export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService){}
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (req.url != "./assets/strings/stringsRO.json" && req.url != "./assets/strings/stringsEN.json"){
            const authToken = this.authService.getToken();
            req = req.clone ({
                setHeaders: {
                    Authorization: "Bearer " + authToken
                }
            });
        }
        return next.handle(req);
    }
}

