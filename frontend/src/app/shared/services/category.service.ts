import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from 'rxjs';
import {CategoryType} from 'src/types/category.type';
import {environment} from 'src/environments/environment';
import {TypeType} from "../../../types/type.type";
import {CategoryWithTypeType} from "../../../types/category-with-type.type";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<CategoryType[]> {
    return this.http.get<CategoryType[]>(environment.api + 'categories')
  }

  getCategoriesWithTypes(): Observable<CategoryWithTypeType[]> {
    return this.http.get<TypeType[]>(environment.api + 'types')
      .pipe(
        map((items: TypeType[]) => {
          const array: CategoryWithTypeType[] = []
          items.forEach((item: TypeType) => {

            const foundItem = array.find(arrayItem => arrayItem.url === item.category.url)

            if (foundItem) {
              foundItem.types.push({
                id: item.id,
                url: item.url,
                name: item.name,
              })
            } else  {
              array.push({
                id: item.category.id,
                url: item.category.url,
                name: item.category.name,
                types: [{
                  id: item.id,
                  url: item.url,
                  name: item.name,
                }]
              })
            }
          })

          return array

        })
      )
  }
}
