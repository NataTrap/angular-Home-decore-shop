import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart-type";
import {CartService} from "../../../shared/services/cart.service";
import {FavouriteService} from "../../../shared/services/favourite.service";
import {FavouriteType} from "../../../../types/favourite.type";
import {DefaulResponseType} from "../../../../types/defaul-response.type";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  count: number = 1
  recommendedProducts: ProductType[] = []
  product!: ProductType;
  serverStaticPath = environment.serverStaticPath
  isLogged: boolean = false;


  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }

  constructor(private productService: ProductService,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService,
              private favouriteService: FavouriteService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url'])
        .subscribe((data: ProductType) => {
          this.product = data
          this.cartService.getCart()
            .subscribe((cartData: CartType | DefaulResponseType) => {
              if ((cartData as DefaulResponseType).error !== undefined) {
                throw new Error((cartData as DefaulResponseType).message)
              }

              const cartDataResponse = cartData as CartType

              if (cartDataResponse) {
                const productInCart = cartDataResponse.items.find(item => item.product.id === this.product.id)
                if (productInCart) {
                  this.product.countInCart = productInCart.quantity
                  this.count = this.product.countInCart
                }
              }
            });

          if (this.authService.getIsLoggedIn()) {
          this.favouriteService.getFavourites()
            .subscribe((data: FavouriteType[] | DefaulResponseType) => {
              if ((data as DefaulResponseType).error !== undefined) {
                const error = (data as DefaulResponseType).message
                throw new Error(error)
              }

              const products = data as FavouriteType[]
              const currentProductExists = products.find(item => item.id === this.product.id)
              if (currentProductExists) {
                this.product.isInFavourite = true
              }
            })
        }
        })
    })
    this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        this.recommendedProducts = data
      })

  }

  updateCount(value: number) {
    this.count = value
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaulResponseType) => {
          if ((data as DefaulResponseType).error !== undefined) {
            throw new Error((data as DefaulResponseType).message)
          }

          this.product.countInCart = this.count
          this.count = 1
        })
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message)
        }

        this.product.countInCart = this.count
      })

  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message)
        }

        this.product.countInCart = 0
        this.count = 1
      })
  }

  updateToFavourite() {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавления в избранное необходимо авторизоваться')
    }
    if (this.product.isInFavourite) {
      this.favouriteService.removeFavourites(this.product.id)
        .subscribe((data: DefaulResponseType) => {
          if (data.error) {
            //...
            throw new Error(data.message)
          }
          this.product.isInFavourite = false
        })
    } else {
      this.favouriteService.addFavourites(this.product.id)
        .subscribe((data: FavouriteType | DefaulResponseType) => {
          if ((data as DefaulResponseType).error !== undefined) {
            throw new Error((data as DefaulResponseType).message)
          }
          this.product.isInFavourite = true
        })
    }
  }

}
