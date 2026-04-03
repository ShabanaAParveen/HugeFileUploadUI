const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Your entry point
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js',
    clean: true, // Cleans the dist folder before each build
  },
  module: {
    rules: [
      {
        // This handles your React (JSX) code
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        // This handles your Bootstrap and CSS files
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'] // Allows you to import files without adding .js or .jsx
  },
  devServer: {
    port: 3000,
    open: true, // Automatically opens your browser
    hot: true,  // Enables Hot Module Replacement
    historyApiFallback: true, // Useful for React Router later
  }
};
