command-line interface for [License Zero](https://licensezero.com) customers and maintainers

```shell
npm i -g licensezero
l0 identify "Jane Dev" US-CA jane@example.com
```

Provide your exact legal name, an [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) code for your tax jurisdiction, and your e-mail address.

## For Users

You can generate quotes for License Zero software within the `node_modules` directories of your projects:

```shell
cd node-project
l0 quote
```

To buy missing licenses for dependencies of a project:

```shell
cd node-project
l0 buy
```

`l0 buy` will open a webpage in your browser listing the licenses to buy and taking credit card payment.  On successful purchase, [licensezero.com](https://licensezero.com) will provide the address of a purchase bundle that you can use to import all of the licenses you've just purchased at once:

```shell
l0 import-bundle https://licensezero.com/purchases/{code}
```

To import a waiver:

```shell
l0 import-waiver waiver.json
```

## For Contributors

To offer private licenses for sale via [licensezero.com](https://licensezero.com), you need to register as a licensor and connect a standard [Stripe](https://stripe.com) account:

```shell
l0 register
```

`l0 register` will open a page in your browser where you can log into Stripe, or create an account and connect it.  Once you've connected a Stripe account, [licensezero.com](https://licensezero.com) will provide you a licensor identifier and an access token that you can use to create a licensor profile:

```shell
l0 set-licensor-id $LICENSOR_ID
```

`l0 set-licensor-id` will then prompt for your access token.

To offer private licenses for a project:

```shell
cd node-project
l0 offer --private 300
```

`l0 offer` will provide a new project identifier that you can use to create `package.json` metadata and `LICENSE`:

```shell
l0 license $PRODUCT_ID --reciprocal
git add package.json LICENSE
git commit -m "License Zero"
git push
```

To generate a waiver for a project, provide a legal name, a jurisdiction code, and either a term in calendar days or `forever`:

```shell
l0 waive $PRODUCT_ID --name "Eve Able" --jurisdiction US-NY --term 90 > waiver.json
```
