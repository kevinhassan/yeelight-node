# Yeelight-node

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Fonctionnalites](#fonctionnalites)
  - [Instructions](#instructions)
- [Technologies](#technologies)
- [Liens externes](#liens-externes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Fonctionnalites

* Allumer / Eteindre manuellement
* Changer de couleur 
* Changer l'intensité lumineuse
* Timer pour l'extinction
* Mettre un reveil lumineux
* Allumer / Eteindre selon l'heure du coucher du soleil (API Météo + géolocalisation)
* Allumer à la reception d'une notification

## Instructions

*Il faut passer l'ampoule dans le mode développeur pour qu'une application tier puisse l'utiliser*

##### Etapes a suivre

* Télécharger l'application Yeelight ([Play Store](https://www.google.fr/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjfycr61fHUAhWLJlAKHRV9DuQQFggnMAA&url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.yeelight.cherry%26hl%3Dfr&usg=AFQjCNH7GOY-jo823U8I-IxlPJD0RaiQWQ) ou [Apple Store](https://www.google.fr/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&uact=8&ved=0ahUKEwjfycr61fHUAhWLJlAKHRV9DuQQFggtMAE&url=https%3A%2F%2Fitunes.apple.com%2Ffr%2Fapp%2Fyeelight%2Fid977125608%3Fmt%3D8&usg=AFQjCNFHiSUqbpIhL0xYO74YPao-NvddUQ))
* Si le matériel n'est pas ajouté faites le
* Une fois le matériel ajouté, appuyer sur celui-ci
* Aller dans les réglages du matériel en haut à droite  
* Puis 'Developer Mode'
* Activer 'Developer Mode'
* Valider 

# Technologies

* Serveur NodeJS API (sur le même réseau que l'ampoule)
* Base de donnée MongoDB et Mongoose 
* Framework JS ReactJS ou AngularJS ou VueJS

# Liens externes

http://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf

 