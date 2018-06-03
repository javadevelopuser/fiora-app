import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import Time from '../../../utils/time';
import expressions from '../../../utils/expressions';

import Avatar from '../../components/Avatar';
import Expression from '../../components/Expression';
import Image from '../../components/Image';

const { width: ScreenWidth } = Dimensions.get('window');

export default class Message extends Component {
    static propTypes = {
        avatar: PropTypes.string.isRequired,
        nickname: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'image', 'url', 'code']),
        time: PropTypes.object,
        content: PropTypes.string.isRequired,
        shouldScroll: PropTypes.bool.isRequired,
        scrollToEnd: PropTypes.func.isRequired,
        isSelf: PropTypes.bool.isRequired,
    }
    componentDidMount() {
        if (this.props.shouldScroll && this.props.scrollToEnd) {
            this.props.scrollToEnd();
        }
    }
    formatTime() {
        const { time } = this.props;
        const nowTime = new Date();
        if (Time.isToday(nowTime, time)) {
            return Time.getHourMinute(time);
        }
        if (Time.isYesterday(nowTime, time)) {
            return `昨天 ${Time.getHourMinute(time)}`;
        }
        return `${Time.getMonthDate(time)} ${Time.getHourMinute(time)}`;
    }
    renderText() {
        const { content, isSelf } = this.props;
        const children = [];
        let offset = 0;
        content.replace(
            /#\(([\u4e00-\u9fa5a-z]+)\)/g,
            (r, e, i) => {
                const index = expressions.default.indexOf(e);
                if (index !== -1) {
                    if (offset < i) {
                        children.push(content.substring(offset, i));
                    }
                    children.push(<Expression key={Math.random()} style={styles.expression} size={30} index={index} />);
                    offset = i + r.length;
                }
                return r;
            },
        );
        if (offset < content.length) {
            children.push(content.substring(offset, content.length));
        }
        return (
            <View style={[styles.textContent, isSelf ? styles.textContentSelf : styles.empty]}>
                <Text style={[styles.text, isSelf ? styles.textSelf : styles.empty]}>{children}</Text>
            </View>
        );
    }
    renderImage() {
        const { content } = this.props;
        const maxWidth = ScreenWidth - 100;
        const maxHeight = 300;
        let scale = 1;
        let width = 0;
        let height = 0;
        const parseResult = /width=([0-9]+)&height=([0-9]+)/.exec(content);
        if (parseResult) {
            [, width, height] = parseResult;
            if (width * scale > maxWidth) {
                scale = maxWidth / width;
            }
            if (height * scale > maxHeight) {
                scale = maxHeight / height;
            }
        }

        return (
            <View style={[styles.imageContent, { width: width * scale, height: height * scale }]}>
                <Image
                    src={content}
                />
            </View>
        );
    }
    renderContent() {
        const { type } = this.props;
        switch (type) {
        case 'text': {
            return this.renderText();
        }
        case 'image': {
            return this.renderImage();
        }
        default:
            return (
                <Text style={styles.notSupport}>不支持的消息类型, 请在Web端查看</Text>
            );
        }
    }
    render() {
        const { avatar, nickname, isSelf } = this.props;
        return (
            <View style={[styles.container, isSelf ? styles.containerSelf : styles.empty]}>
                <Avatar src={avatar} size={44} />
                <View style={[styles.info, isSelf ? styles.infoSelf : styles.empty]}>
                    <View style={styles.nickTime}>
                        <Text style={styles.nick}>{nickname}</Text>
                        <Text style={styles.time}>{this.formatTime()}</Text>
                    </View>
                    <View style={styles.content}>
                        {this.renderContent()}
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    containerSelf: {
        flexDirection: 'row-reverse',
    },
    empty: {},
    info: {
        marginLeft: 8,
        marginRight: 8,
        maxWidth: ScreenWidth - 120,
    },
    infoSelf: {
        alignItems: 'flex-end',
    },
    nickTime: {
        flexDirection: 'row',
    },
    nick: {
        fontSize: 13,
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    content: {
        flexDirection: 'row',
        marginTop: 2,
    },
    textContent: {
        maxWidth: '100%',
        backgroundColor: 'white',
        borderRadius: 6,
        padding: 5,
        paddingLeft: 8,
        paddingRight: 8,
    },
    textContentSelf: {
        backgroundColor: '#2a7bf6',
    },
    text: {
        color: '#333',
        width: '100%',
    },
    textSelf: {
        color: 'white',
    },
    expression: {
        marginLeft: 1,
        marginRight: 1,
        transform: [{
            translate: [0, 3],
        }],
    },
    notSupport: {
        color: '#73b668',
    },
    imageContent: {
        width: 300,
    },
});
