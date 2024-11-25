import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {FavouriteType} from "../../../types/favourite.type";
import {DefaulResponseType} from "../../../types/defaul-response.type";

@Injectable({
  providedIn: 'root'
})
export class FavouriteService {

  constructor(private http: HttpClient) {
  }

  getFavourites(): Observable<FavouriteType[] | DefaulResponseType> {
    return this.http.get<FavouriteType[] | DefaulResponseType>(environment.api + 'favorites')
  }

  removeFavourites(productId: string): Observable<DefaulResponseType> {
    return this.http.delete<DefaulResponseType>(environment.api + 'favorites', {body: {productId}})
  }

  addFavourites(productId: string): Observable<FavouriteType | DefaulResponseType> {
    return this.http.post<FavouriteType | DefaulResponseType>(environment.api + 'favorites', {productId})
  }
}
