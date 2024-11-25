import {Component, OnInit} from '@angular/core';
import {FavouriteService} from "../../../shared/services/favourite.service";
import {FavouriteType} from "../../../../types/favourite.type";
import {DefaulResponseType} from "../../../../types/defaul-response.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart-type";

@Component({
  selector: 'app-favourite',
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.scss']
})
export class FavouriteComponent implements OnInit {

  products: FavouriteType[] = []
  serverStaticPath = environment.serverStaticPath
  cart: CartType | null = null;

  constructor(private favouriteService: FavouriteService,
              private cartService: CartService) {
  }

  count: number = 1
  ngOnInit(): void {
    this.favouriteService.getFavourites()
      .subscribe((data: FavouriteType[] | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          const error = (data as DefaulResponseType).message
          throw new Error(error)
        }

        this.products = data as FavouriteType[]
      })


    this.cartService.getCart()
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message);
        }

        this.cart = data as CartType;

        if (this.cart && this.cart.items.length > 0) {
          this.products = this.products.map(product => {
            if (this.cart) {
              const productInCart = this.cart.items.find(item => item.product.id === product.id);

              if (productInCart) {
                product.countInCart = productInCart.quantity
              }
            }

            return product;
          });
        }
      });


  }


  removeFromFavourites(productForDelete: FavouriteType) {
    this.favouriteService.removeFavourites(productForDelete.id)
      .subscribe((data: DefaulResponseType) => {
        if (data.error) {
          //...
          throw new Error(data.message)
        }
        this.products = this.products.filter(item => item.id !== productForDelete.id)

      })
  }
}
