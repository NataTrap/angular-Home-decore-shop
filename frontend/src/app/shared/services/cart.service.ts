import {Injectable} from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CartType} from "../../../types/cart-type";
import {DefaulResponseType} from "../../../types/defaul-response.type";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private count: number = 0
  count$: Subject<number> = new Subject<number>()

  constructor(private http: HttpClient) {
  }

  setCount (count: number) {
    this.count = count
    this.count$.next(this.count)
  }

  getCart(): Observable<CartType | DefaulResponseType> {
    return this.http.get<CartType| DefaulResponseType>(environment.api + 'cart', {withCredentials: true})
  }


  updateCart(productId: string, quantity: number): Observable<CartType | DefaulResponseType> {
    return this.http.post<CartType | DefaulResponseType>(environment.api + 'cart', {productId, quantity}, {withCredentials: true})
      .pipe(
        tap(data => {
          if (!data.hasOwnProperty('error')) {
            let count = 0;
            (data as CartType).items.forEach(item => {
              count += item.quantity
            });
            this.setCount(count)
          }
          }
        )
      )
  }

  getCartCount(): Observable<{ count: number } | DefaulResponseType> {
    return this.http.get<{ count: number } | DefaulResponseType>(environment.api + 'cart/count', {withCredentials: true})
      .pipe(
        tap(data => {

          if (!data.hasOwnProperty('error')) {
            this.setCount((data as { count: number }).count)
          }
          }
        )
      )
  }
}
