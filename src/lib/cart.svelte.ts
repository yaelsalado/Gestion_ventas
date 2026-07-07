interface CartItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
}

class CartStore {
    items = $state<CartItem[]>([]);

    load() {
        const savedCart = localStorage.getItem('cart');

        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }

    private save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    addProduct(product: { id: number; product_name: string; price: number }) {
        const existing = this.items.find(item => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }

        this.save();
    }

    increaseQuantity(id: number) {
        const item = this.items.find(item => item.id === id);

        if (item) {
            item.quantity += 1;
            this.save();
        }
    }

    decreaseQuantity(id: number) {
        const item = this.items.find(item => item.id === id);

        if (item) {
            item.quantity -= 1;

            if (item.quantity <= 0) {
                this.items = this.items.filter(i => i.id !== id);
            }

            this.save();
        }
    }

    cancelOrder() {
        this.items = [];
        localStorage.removeItem('cart');
    }

    get total() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
}

export const cart = new CartStore();