import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        name
        role
        country
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        email
        name
        role
        country
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      country
    }
  }
`;

export const RESTAURANTS_QUERY = gql`
  query Restaurants {
    restaurants {
      id
      name
      country
      cuisine
      address
      imageUrl
      menuItems {
        id
        name
        description
        price
        category
        isAvailable
      }
    }
  }
`;

export const RESTAURANT_QUERY = gql`
  query Restaurant($id: ID!) {
    restaurant(id: $id) {
      id
      name
      country
      cuisine
      address
      imageUrl
      menuItems {
        id
        name
        description
        price
        category
        isAvailable
      }
    }
  }
`;

export const MY_ORDERS_QUERY = gql`
  query MyOrders {
    myOrders {
      id
      status
      total
      createdAt
      restaurant {
        id
        name
        country
        cuisine
        address
      }
      items {
        id
        quantity
        price
        menuItem {
          id
          name
          category
        }
      }
      paymentMethod {
        id
        type
        label
        last4
      }
    }
  }
`;

export const ALL_ORDERS_QUERY = gql`
  query Orders {
    orders {
      id
      status
      total
      createdAt
      user {
        id
        name
        email
        role
        country
      }
      restaurant {
        id
        name
        country
      }
      items {
        id
        quantity
        price
        menuItem {
          id
          name
        }
      }
      paymentMethod {
        id
        type
        label
        last4
      }
    }
  }
`;

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      total
      createdAt
      restaurant {
        id
        name
      }
      items {
        id
        quantity
        price
        menuItem {
          id
          name
        }
      }
    }
  }
`;

export const CHECKOUT_ORDER_MUTATION = gql`
  mutation CheckoutOrder($input: CheckoutOrderInput!) {
    checkoutOrder(input: $input) {
      id
      status
      total
      paymentMethod {
        id
        type
        label
        last4
      }
    }
  }
`;

export const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export const MY_PAYMENT_METHODS_QUERY = gql`
  query MyPaymentMethods {
    myPaymentMethods {
      id
      type
      label
      last4
      isDefault
      createdAt
    }
  }
`;

export const CREATE_PAYMENT_METHOD_MUTATION = gql`
  mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      id
      type
      label
      last4
      isDefault
    }
  }
`;

export const UPDATE_PAYMENT_METHOD_MUTATION = gql`
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      id
      type
      label
      last4
      isDefault
    }
  }
`;

export const DELETE_PAYMENT_METHOD_MUTATION = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id) {
      id
    }
  }
`;
