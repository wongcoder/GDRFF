import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import servername from './const'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  button: {
    margin: theme.spacing.unit,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
});

class TextFields extends React.Component {
  state = {
    longitude: 0,
    latitude: 0,
    audiotext: '',
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handlePostRequest() {
    const data = {
        audio: {
            audiotext: this.state.audiotext
        },
        df: {
            lob: `${this.state.latitude}, ${this.state.longitude}`
        }
    }
    console.log(data)
    console.log(JSON.stringify(data, null, 2))
    fetch(`${servername}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data, null, 2)
    }).then(res => console.log(res))
  }
  render() {
    const { classes } = this.props;

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <TextField
          id="standard-audio"
          label="audiotext"
          className={classes.textField}
          value={this.state.audiotext}
          onChange={this.handleChange('audiotext')}
          margin="normal"
        />

        <TextField
        id="standard-df"
        label="latitude"
        value={this.state.latitude}
        onChange={this.handleChange('latitude')}
        type="number"
        className={classes.textField}
        InputLabelProps={{
            shrink: true,
        }}
        margin="normal"
        />

        <TextField
          id="standard-df"
          label="longitude"
          value={this.state.longitude}
          onChange={this.handleChange('longitude')}
          type="number"
          className={classes.textField}
          InputLabelProps={{
            shrink: true,
          }}
          margin="normal"
        />

        <Button variant="contained" color="primary" className={classes.button} onClick={() => this.handlePostRequest()}>
            Primary
        </Button>
      </form>
    );
  }
}

TextFields.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TextFields);