# Imperial Suite Website #

Because GitHub wiki is terrible.

WikiCreole help [here](http://search.cpan.org/~jburnett/Text-WikiCreole-0.07/lib/Text/WikiCreole.pm)

## Building ##

### Initial steps ###

```sh
git clone git@github.com:imp-erial/website.git
cd website
git clone git@github.com:imp-erial/website.git release
cd release
git checkout gh-pages

# Install perl and cpanm, then:
cpanm File::Slurp HTML::Escape Text::WikiCreole URI::Split
```

### Typical steps ###

```sh
# From website/release directory...
git pull --ff
perl ../build.pl -o .
git commit -am "update site" && git push origin HEAD
```
