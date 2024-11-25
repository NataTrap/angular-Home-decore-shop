import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart-type";
import {DefaulResponseType} from "../../../../types/defaul-response.type";
import {FavouriteType} from "../../../../types/favourite.type";
import {FavouriteService} from "../../services/favourite.service";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {

  @Input() product!: ProductType
  @Input() isLight: boolean = false
  @Input() countInCart: number | undefined = 0
  isLogged: boolean = false;

  serverStaticPath = environment.serverStaticPath
  count: number = 1

  constructor(private cartService: CartService,
              private favouriteService: FavouriteService,
              private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar) {
  }


  ngOnInit(): void {
    // Отображаемый актуальное количество товаров
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart
    }

    this.isLogged = this.authService.getIsLoggedIn();
  }


  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message)
        }

        this.countInCart = this.count
      })

  }

  updateCount(value: number) {
    this.count = value
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaulResponseType) => {
          if ((data as DefaulResponseType).error !== undefined) {
            throw new Error((data as DefaulResponseType).message)
          }

          this.countInCart = this.count
          this.count = 1
        })

    }

  }


  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message)
        }

        this.countInCart = 0
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


  navigate( ) {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url])
    }
  }

}
