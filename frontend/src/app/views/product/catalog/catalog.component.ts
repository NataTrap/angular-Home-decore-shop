import {Component, HostListener, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {AppliedFilterType} from "../../../../types/applied-filter.type";
import {debounceTime} from "rxjs";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart-type";
import {FavouriteService} from "../../../shared/services/favourite.service";
import {FavouriteType} from "../../../../types/favourite.type";
import {DefaulResponseType} from "../../../../types/defaul-response.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  products: ProductType[] = []
  categoriesWithType: CategoryWithTypeType[] = []
  activeParams: ActiveParamsType = {types: []};
  appliedFilters: AppliedFilterType[] = []
  sortingOpen = false // Храним состояние Открытого элемента
  sortingOptions: { name: string, value: string }[] = [
    {
      // В value Мы будем хранить то Значение которое мы будем Использовать И хранить его urlquery Параметрах Для того чтобы отправлять на backend
      name: 'От А до Я', value: 'az-asc'
    },
    {name: 'От Я до А', value: 'az-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];

  pages: number[] = []
  cart: CartType | null = null
  favouriteProducts: FavouriteType[] | null = null


  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private cartService: CartService,
              private favouriteService: FavouriteService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.cartService.getCart()
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message)
        }
        this.cart = data as CartType

        this.activeParams.page = 1;

        let queryParams = { ...this.activeParams };

        if (!queryParams.page) {
          queryParams.page = 1;
        }

        this.router.navigate(['/catalog'], {
          queryParams: queryParams
        });





        if (this.authService.getIsLoggedIn()) {

          this.favouriteService.getFavourites()
            .subscribe({
              next: (data: FavouriteType[] | DefaulResponseType) => {
                if ((data as DefaulResponseType).error !== undefined) {
                  const error = (data as DefaulResponseType).message
                  this.processCatalog()
                  throw new Error(error)
                }
                this.favouriteProducts = data as FavouriteType[]
                this.processCatalog()
              },
              error: (error) => {
                this.processCatalog()
              }
            })


        } else  {
          this.processCatalog()
        }
      })

  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.catalog-sorting')) {
      this.sortingOpen = false;
    }
  }



  processCatalog() {
    this.categoryService.getCategoriesWithTypes()
      .subscribe(data => {
        this.categoriesWithType = data

        this.activatedRoute.queryParams
          .pipe(
            debounceTime(500)
          )
          .subscribe(params => {
            this.activeParams = ActiveParamsUtil.processParam(params);

            this.appliedFilters = []
            this.activeParams.types.forEach(url => {

              // this.categoriesWithType Здесь мы храним все категории со всеми типами Которые вообще есть на нашей странице

              for (let i = 0; i < this.categoriesWithType.length; i++) {
                const foundType = this.categoriesWithType[i].types.find(type => type.url === url)
                if (foundType) {
                  this.appliedFilters.push({
                    name: foundType.name,
                    urlParam: foundType.url
                  })
                }
              }
            });


            if (this.activeParams.heightFrom) {
              this.appliedFilters.push({
                name: 'Высота: от ' + this.activeParams.heightFrom + ' см',
                urlParam: 'heightFrom'
              })
            }

            if (this.activeParams.heightTo) {
              this.appliedFilters.push({
                name: 'Высота: до ' + this.activeParams.heightTo + ' см',
                urlParam: 'heightTo'
              })
            }

            if (this.activeParams.diameterFrom) {
              this.appliedFilters.push({
                name: 'Диаметр: от ' + this.activeParams.diameterFrom + ' см',
                urlParam: 'diameterFrom'
              })
            }

            if (this.activeParams.diameterTo) {
              this.appliedFilters.push({
                name: 'Диаметр: до ' + this.activeParams.diameterTo + ' см',
                urlParam: 'diameterTo'
              })
            }

            // Вывести на странице следующий текст "Товары не найдены попробуйте изменить параметры поиска" !
            this.productService.getProducts(this.activeParams)
              .subscribe(data => {
                this.pages = []
                for (let i = 1; i <= data.pages; i++) {
                  this.pages.push(i)
                }

                if (this.cart && this.cart.items.length > 0) {
                  this.products = data.items.map(product => {
                    if (this.cart) {
                      const productInCart = this.cart.items.find(item => item.product.id === product.id)
                      if (productInCart) {
                        product.countInCart = productInCart.quantity
                      }
                    }

                    return product
                  })
                } else {
                  this.products = data.items
                }

                if (this.favouriteProducts) {
                  this.products = this.products.map(product => {
                    const productInFavourite = this.favouriteProducts?.find(item => item.id === product.id)
                    if (productInFavourite) {
                      product.isInFavourite = true
                    }
                    return product
                  })
                }

              })

          });


      })


  }


  // Дебаг
  removeAppliedFilter(appliedFilter: AppliedFilterType) {
    if (appliedFilter.urlParam === 'heightFrom' || appliedFilter.urlParam === 'heightTo' ||
      appliedFilter.urlParam === 'diameterFrom' || appliedFilter.urlParam === 'diameterTo') {
      delete this.activeParams[appliedFilter.urlParam]
    } else {
      this.activeParams.types = this.activeParams.types.filter(item => item !== appliedFilter.urlParam)
    }
    this.activeParams.page = 1
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }

  // Открывает и закрывает сортировку
  toggleSorting() {
    this.sortingOpen = !this.sortingOpen
  }

  sort(value: string) {
    this.activeParams.sort = value;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }

  openPage(page: number) {
    this.activeParams.page = page
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }

  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      })
    }

  }

  openNextPage() {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      })
    }
  }

}
