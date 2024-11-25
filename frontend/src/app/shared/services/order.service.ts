import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {DefaulResponseType} from "../../../types/defaul-response.type";
import {OrderType} from "../../../types/order.type";

@Injectable({
  providedIn: 'root'
})
export class OrderService {



  constructor(private http: HttpClient) {
  }


  createOrder(params: OrderType): Observable<OrderType | DefaulResponseType> {
    return this.http.post<OrderType | DefaulResponseType>(environment.api + 'orders', params, {withCredentials: true})
  }

  getOrders(): Observable<OrderType[] | DefaulResponseType> {
    return this.http.get<OrderType[] | DefaulResponseType>(environment.api + 'orders',)
  }

}
