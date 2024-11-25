import {Component, OnInit} from '@angular/core';
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {DefaulResponseType} from "../../../../types/defaul-response.type";
import {OrderStatusUtil} from "../../../shared/utils/order-status.util";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: OrderType[] = []

  constructor(private orderService: OrderService) {
  }

  ngOnInit(): void {

    this.orderService.getOrders()
      .subscribe((data: OrderType[] | DefaulResponseType) => {
        if ((data as DefaulResponseType).error !== undefined) {
          throw new Error((data as DefaulResponseType).message)
        }

        this.orders = (data as OrderType[]).map(item => {
          const status = OrderStatusUtil.getStatusAndColor(item.status)

          item.statusRus = status.name;
          item.color = status.color ;
          return item
        });

      })
  }

}
