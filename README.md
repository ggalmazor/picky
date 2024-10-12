# (nit)Picky

![CI](https://github.com/ggalmazor/picky/actions/workflows/ci.yml/badge.svg)

(nit)Picky explains the acronyms that you use in Slack:
- Invite Picky to a channel and it will listen to what you say
- When someone uses an acronym, Picky will define it.
- Picky remembers all the acronyms that has explained. However, Picky makes up random definitions, so you better make it learn the good ones!

## Commands: Learn new acronym definition

You can teach Picky new acronym definitions:
```
@picky learn <acronym> <definition>
```

Picky will add a ✅ reaction when it's done and it will use it along with any other existing definition when explaining the acronym.

## Commands: Forget an acronym definition

You can make Picky forget acronym definitions:
```
@picky forget <acronym> <definition>
```

Picky will add a ✅ reaction when it's done and it will stop using it along when explaining the acronym.
