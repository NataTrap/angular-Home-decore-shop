import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CartService} from "../../services/cart.service";
import {FavouriteType} from "../../../../types/favourite.type";
import {CartType} from "../../../../types/cart-type";
import {DefaulResponseType} from "../../../../types/defaul-response.type";
import {FavouriteService} from "../../services/favourite.service";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss']
})
export class AddToCartComponent {

  @Input() product!: FavouriteType;
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;
  @Input() countInCart: number | undefined = 0;
  @Output() productForRemove: EventEmitter<FavouriteType> = new EventEmitter<FavouriteType>();

  constructor(private favoriteService: FavouriteService,
              private cartService: CartService) {
  }

  removeProductInFavorite() {
    this.productForRemove.emit(this.product);
  }

  ngOnInit() {
    this.cartService.getCart()
      .subscribe((cartData: CartType | DefaulResponseType) => {
        if ((cartData as DefaulResponseType).error !== undefined) {
          throw new Error((cartData as DefaulResponseType).message);
        }

        const cartDataResponse = cartData as CartType;

        if (cartDataResponse) {
          const productInCart = cartDataResponse.items.find(item => item.product.id === this.product.id);
          if (productInCart) {
            this.product.countInCart = productInCart.quantity;
            this.count = this.product.countInCart;
          }
        }
      });
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message);
        }
        this.countInCart = this.count;
      });
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message);
        }

        this.countInCart = 0;
        this.count = 1;
      });
  }

  updateCount(value: number) {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaulResponseType) => {
          if ((data as DefaulResponseType).error !== undefined) {
            throw new Error((data as DefaulResponseType).message);
          }

          this.countInCart = this.count;
        });
    }
  }

}
