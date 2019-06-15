# Change Log

The `hue-connect` package adheres to [semver](http://semver.org/) and follows [this changelog style](http://keepachangelog.com/en/1.0.0/).

## Unreleased
### Removed
- Drops support for node versions < 8.0.0.

### Security
- Upgrades axios to resolve an unspecified security alert.

## v0.2.1
### Fixed
- `hue-register` would never terminate if more than one bridge was found (issue #2).

## v0.2.0
### Added
- New `hue-register` command.

## v0.1.2
### Fixed
- Removed unnecessary dependencies (some babel plugins).

## v0.1.1
### Fixed
- Transpile the files before publishing.

## v0.1.0
Initial release
