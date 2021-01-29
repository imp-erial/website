# Imperial Suite Website #

Because GitHub wiki is terrible.

WikiCreole help [here](http://search.cpan.org/~jburnett/Text-WikiCreole-0.07/lib/Text/WikiCreole.pm)

## Building ##

### Initial steps ###

```sh
# Install perl and cpanm, then:
cpanm File::Slurp HTML::Escape Text::WikiCreole URI::Split File::Remove
```

### Typical steps ###

Simply run `./build.pl -a` from the root directory.
