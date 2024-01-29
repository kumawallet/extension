# Contributing

1. [Fork it](https://help.github.com/articles/fork-a-repo/)
2. Install dependencies (`npm ci`)
3. Create your feature branch (`git checkout -b my-new-feature`)
4. Make sure you can [sign commmits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
5. Commit your changes (`git commit -s -am 'Added some feature'`)
6. Test your changes (`npm test`)
7. Push to the branch (`git push origin my-new-feature`)
8. [Create new Pull Request](https://help.github.com/articles/creating-a-pull-request/)

## Testing

Run our test suite with this command:

```
npm test
```

## Code Style

We use [Prettier](https://prettier.io/) and tslint to maintain code style and best practices.
Please make sure your PR adheres to the guides by running:

```
npm run lint
```