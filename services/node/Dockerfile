# TODO: Don't use latest in production
FROM node:latest

# WORKDIR /app
# RUN npm create vite@latest deli_react_app -- --template react-ts

WORKDIR /app-react/spreact_react_app
# RUN npm install

# Lovely bootstrap
RUN npm install axios @types/react-router-dom react-router-dom http-proxy-middleware react-validation validator formik yup
RUN npm install react-bootstrap bootstrap react-bootstrap-multiselect

RUN npm install 


CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
