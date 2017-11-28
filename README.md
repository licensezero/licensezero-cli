command-line interface for [License Zero](https://licensezero.com) customers and maintainers

```shell
npm i -g licensezero
```

## For Customers

To generate quotes and buy licenses you will need to create a local profile for yourself, your company, or your client.

Provide a short nickname for your profile, an exact legal name, an [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) code for your tax jurisdiction, and a license tier: `solo` for solo licenses, `team` for licenses covering up to 10 people, `company` for licenses covering up to 100, and `enterprise` for unlimited licenses.

```shell
licensezero create-licensee mycompany "Something, Inc." US-CA company
```

You can create as many licensor profiles as you like.  For example, one for yourself, one for your side business, one for each of your consulting clients.  To list them all:

```shell
licensezero list-licensors
```

Using the profile nickname, you can generate quotes for License Zero software within the `node_modules` directories of your projects:

```shell
cd node-project
licensezero quote mycompany
```

To buy missing licenses for dependencies of a project:

```shell
cd node-project
licensezero buy mycompany
```

`licensezero buy` will open a webpage in your browser listing the licenses to buy and taking credit card payment.  On successful purchase, [licensezero.com](https://licensezero.com) will provide the address of a purchase bundle that you can use to import all of the licenses you've just purchased at once:

```shell
licensezero purchase https://licensezero.com/purchases/{code}
```

To import a waiver:

```shell
licensezero import-waiver waiver.json
```

## For Maintainers

To offer private licenses for sale via [licensezero.com](https://licensezero.com), you need to register as a licensor and connect a standard [Stripe](https://stripe.com) account.

Provide your e-mail address, your exact legal name, and an [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) code for your tax jurisdiction:

```shell
licensezero register-licensor "dev@example.com" "John Smith" US-CA
```

`licensezero register-licensor` will open a page in your browser where you can log into Stripe, or create an account and connect it.  Once you've connected a Stripe account, [licensezero.com](https://licensezero.com) will provide you a licensor identifier and an access token that you can use to create a licensor profile:

```shell
licensezero create-licensor $LICENSOR_ID
```

`licensezero create-licensor` will then prompt for your access token.

To offer private licenses for a project:

```shell
cd node-project
licensezero offer --solo 300 --team 400 --company 500 --enterprise 600
```

`licensezero offer` will provide a new project identifier that you can use to create `package.json` metadata and `LICENSE`:

```shell
licensezero license $PRODUCT_ID
git add package.json LICENSE
git commit -m "License Zero"
git push
```

To generate a waiver for a project, provide a legal name, a tax jurisdiction code, and either a term in calendar days or `forever`:

```shell
licensezero waive $PRODUCT_ID --name "Eve Able" --jurisdiction US-NY --term 90 > waiver.json
```
