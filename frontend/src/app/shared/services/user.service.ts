import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {DefaulResponseType} from "../../../types/defaul-response.type";
import { UserInfoType} from "../../../types/user-info.type";

@Injectable({
  providedIn: 'root'
})
export class UserService {



  constructor(private http: HttpClient) {
  }


  updateUserInfo(params: UserInfoType): Observable<DefaulResponseType> {
    return this.http.post<DefaulResponseType>(environment.api + 'user', params)
  }

  getUserInfo(): Observable<UserInfoType | DefaulResponseType> {
    return this.http.get<UserInfoType | DefaulResponseType>(environment.api + 'user')
  }

}
