var path = require("path")
var webpack = require("webpack")
var ExtractTextPlugin = require("extract-text-webpack-plugin")

// Paramètre --production: Fait varier la manière d'exporter
var production = process.argv.indexOf("--production") > -1;

module.exports = {
  devtool: 'eval',
  serverIp: '10.5.1.67',

  // Entrées
  entry: {
    bundle:[
      // Mises à jour à chaud
      'webpack/hot/dev-server', 

      // Rafraichissement auto
      'webpack-dev-server/client?http://10.5.1.67:8080', 

      // Notre application
      "./src/bundle.js"
    ],
  },

  // Sorties
  output: {
    path: 'dist/assets/',
    filename: "bundle.js",
    publicPath:'/dist/'
  },

  resolve: {
    // extensions lues pour require()
    extensions: [
      "",
      ".js",
      ".json",
    ],
  },

  module: {
    // les premiers en dernier, en utilisant la sortie du suivant
    loaders: [
      {
        // pour tous les fichiers .js
        test: /\.js$/,
        // ... en prenant bien soin d'exclure les node_modules
        exclude: /node_modules/,

        // on utilise babel et eslint
        loaders: [
          "babel",
          "eslint",
        ],
      },
      // Pour les fichiers JSON on utilise un loader spécifique
      {
        test: /\.json$/,
        loaders: [
          "json",
        ],
      },
      {
        // Pour tous les fichiers CSS
        test: /\.css$/,
        // On utilise ExtractTextPlugin qui nous permettra d'avoir un .css à part et non dans le JS
        // cette méthode possède 2 paramètres :
        // .extract(loaders à utiliser si ce module est désactivé, loaders à utiliser dans tous les cas en amont)
        loader: ExtractTextPlugin.extract(
          // si on extract pas, on utilisera le loader suivant
          // (ce module chargera les styles dans des tags <style>, suffisant en mode dév)
          // en production vous devrez vous charger d'utiliser un <link rel="stylesheet" ...
          "style",
          // dans tous les cas, on utilisera cssnext ainsi que le loader CSS de base (celui-ci permet de gérer les ressources dans le CSS
          // en temps que modules: images, font etc)
          "css!cssnext"
        ),
        // Si vous n'avez pas besoin d'avoir une CSS à part, vous pouvez
        // simplement supprimer la partie "loader" ci-dessus et utiliser plutôt loaders: [
        //  "style",
        //  "css",
        //  "cssnext",
        // ],
        // À noter que dans ce cas, il vous faudra supprimer le plugin
        // ExtractTextPlugin dans la liste plus bas
      },
      // pour la suite, on va rester simple :
      // un require() en utilisant le file-loader retournera une string avec
      // le nom du fichier et (le plus important) copiera le fichier suivant
      // le paramètre "name" dans l'output.path que nous avons défini tout
      // au début de notre configuration.
      // Notez qu'il dégagera la partie context du nom lors du retour en string
      // et la remplacera par le l'output.path défini pour la copie.
      {
        // on chargera tous les formats d'images qui nous intéressent en tant
        // que fichiers.
        test: /\.(ico|jpe?g|png|gif)$/,
        loaders: [
          "file?name=[path][name].[ext]&context=./src",
          // Vous remarquerez ici la méthode utilisée pour définir
          // des options pour les loaders. Il en existe d'autres avec les
          // versions les plus récentes en utilisant la clé "query"
        ],
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&minetype=application/font-woff"
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&minetype=application/font-woff"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&minetype=application/octet-stream"
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&minetype=image/svg+xml"
      },
      {
        // ici on se permet de loader des fichiers html et txt tels quels
        test: /\.(html|txt)$/,
        loaders: [
          "file?name=[path][name].[ext]&context=./src",
        ],
      },
    ],
  },

  // en plus des loaders, qui premettent eux de modifier et/ou d'exploiter le
  // contenu des modules, nous avons des plugins, plus globaux au processus
  plugins: (
    [
      // une partie importante dans notre cas : on active l'extraction CSS (en
      // production seulement)
      new ExtractTextPlugin("[name].css", {disable: !production}),

      // ce plugin permet de transformer les clés passés en dur dans les
      // modules ainsi vous pourrez faire dans votre code js
      // if (__PROD__) { ... }
      new webpack.DefinePlugin({
        __PROD__: production
      }),
    ]
    // en production, on peut rajouter des plugins pour optimiser
    .concat(
      production
      ? [
        // ici on rajoute uglify.js pour compresser nos sorties
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
          },
        }),
      ]
      : [new webpack.HotModuleReplacementPlugin()] // En dev, on ajoute le module de rafraichissement à chaud
    )
  ),

  // certains modules permettent de définir des options en dehors de la définition des loaders
  cssnext: {
    sourcemap: !production,
    compress: production,
  },
}