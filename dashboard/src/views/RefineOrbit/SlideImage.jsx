import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { Card } from 'primereact/card';
import Lightbox from 'react-images';

class SlideImage extends Component {
  state = this.initialState;

  get initialState() {
    return {
      lightboxIsOpen: false,
      currentImage: 0,
    };
  }

  render() {
    const images = this.props;
    console.log('imagens', this.props);
    const slide = (
      <img
        // style={{ width: 'inherit' }}
        onClick={this.Slideshow}
        width="225"
        height="180"
        src={`plot${images}`}
      />
    );

    return (
      <Grid>
        <Row>
          <Col md={6}>
            <Card
              // title={`Plot object 2013 RR98 ${index}`}
              subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
            >
              {slide}
            </Card>
          </Col>
        </Row>
        <Lightbox
          images={images}
          isOpen={this.state.lightboxIsOpen}
          onClickPrev={this.gotoPrevLightboxImage}
          onClickNext={this.gotoNextLightboxImage}
          onClose={this.CloseLightbox}
          currentImage={this.state.currentImage}
          onClickImage={this.handleClickImage}
        />
      </Grid>
    );
  }
}

export default SlideImage;
