interface CartItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
}

class CartStore {
    carts = $state<Record<string, CartItem[]>>({
        caja: []
    });

    activeContext = $state("caja");

    get items() {
        return this.carts[this.activeContext] ?? [];
    }

    get total() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    totalDe(context: string) {
        const items = this.carts[context] ?? [];
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    setContext(context: string) {
        this.activeContext = context;

        if (!this.carts[context]) {
            this.carts[context] = [];
        }

        this.save();
    }

    addProduct(product: { id: number; product_name: string; price: number }) {
        const items = this.carts[this.activeContext] ?? (this.carts[this.activeContext] = []);
        const existing = items.find(item => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            items.push({ ...product, quantity: 1 });
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
        const items = this.carts[this.activeContext];
        const item = items?.find(item => item.id === id);

        if (item) {
            item.quantity -= 1;

            if (item.quantity <= 0) {
                this.carts[this.activeContext] = items.filter(i => i.id !== id);
            }

            this.save();
        }
    }

    cancelOrder() {
        this.carts[this.activeContext] = [];
        this.save();
    }

    load() {
        const saved = localStorage.getItem("cart");

        if (saved) {
            this.carts = JSON.parse(saved);
        }
    }

    private save() {
        localStorage.setItem("cart", JSON.stringify(this.carts));
    }
}

export const cart = new CartStore();